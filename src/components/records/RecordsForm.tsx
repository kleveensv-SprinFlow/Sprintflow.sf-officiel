import React, { useState } from 'react';
import { Trophy, Search, PlusCircle } from 'lucide-react';
import { Record } from '../../types';
import { useExercices, CATEGORIES } from '../../hooks/useExercices';
import { CustomExerciceForm } from './CustomExerciceForm';

interface RecordsFormProps {
  records: Record[];
  onSave: (record: Omit<Record, 'id'>) => void;
  onCancel: () => void;
}

export const RecordsForm: React.FC<RecordsFormProps> = ({ records, onSave, onCancel }) => {
  const [type, setType] = useState<'run' | 'exercise' | 'jump' | 'throw'>('exercise');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedCategorie, setSelectedCategorie] = useState<string>('');
  const [selectedExerciceId, setSelectedExerciceId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciceName, setExerciceName] = useState('');

  const { exercices, loading, getExercicesByCategorie, searchExercices, getExerciceById, loadExercices } = useExercices();

  const handleCategorieChange = (cat: string) => {
    setSelectedCategorie(cat);
    setSelectedExerciceId('');
    setSearchQuery('');
    setExerciceName('');
  };

  const handleExerciceChange = (exerciceId: string) => {
    setSelectedExerciceId(exerciceId);
    const exercice = getExerciceById(exerciceId);
    if (exercice) {
      setExerciceName(exercice.nom);
    }
  };
  
  const handleCustomFormSave = () => {
    setShowCustomForm(false);
    loadExercices(); // Refresh the list
  };

  const filteredExercices = selectedCategorie
    ? searchQuery
      ? searchExercices(searchQuery, selectedCategorie)
      : getExercicesByCategorie(selectedCategorie)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value || !date || (type !== 'exercise' && !exerciceName)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (type === 'exercise' && !selectedExerciceId) {
      alert('Veuillez sélectionner un exercice dans la liste');
      return;
    }

    const record: Omit<Record, 'id'> = {
      type,
      name: exerciceName,
      value: parseFloat(value),
      unit: type === 'run' ? 's' : type === 'exercise' ? 'kg' : 'm',
      date,
      ...(type === 'exercise' && { exercice_reference_id: selectedExerciceId }),
    };

    onSave(record);
    
    setValue('');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedCategorie('');
    setSelectedExerciceId('');
    setSearchQuery('');
    setExerciceName('');
  };

  if (showCustomForm) {
    return <CustomExerciceForm onSave={handleCustomFormSave} onCancel={() => setShowCustomForm(false)} />;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Trophy className="h-6 w-6 mr-2 text-accent-500" />
          Nouveau record
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="record-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de record
            </label>
            <select
              id="record-type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="exercise">Musculation</option>
              <option value="run">Course</option>
              <option value="jump">Saut</option>
              <option value="throw">Lancer</option>
            </select>
          </div>

          {type === 'exercise' ? (
            <>
              <div>
                <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  id="categorie"
                  value={selectedCategorie}
                  onChange={(e) => handleCategorieChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {selectedCategorie && (
                <>
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Filtrer les exercices
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tapez pour filtrer..."
                        className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="exercice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exercice
                    </label>
                    <select
                      id="exercice"
                      value={selectedExerciceId}
                      onChange={(e) => handleExerciceChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      required
                      disabled={loading}
                    >
                      <option value="">Sélectionner un exercice</option>
                      {filteredExercices.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.nom}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(true)}
                      className="mt-2 text-sm text-accent-500 hover:text-accent-600 flex items-center"
                    >
                      <PlusCircle className="w-4 h-4 mr-1" />
                      Créer un exercice personnalisé
                    </button>
                    {filteredExercices.length === 0 && selectedCategorie && (
                      <p className="mt-1 text-xs text-gray-500">
                        {searchQuery ? 'Aucun exercice trouvé' : 'Aucun exercice dans cette catégorie'}
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du record
              </label>
              <input
                id="name"
                type="text"
                value={exerciceName}
                onChange={(e) => setExerciceName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                placeholder={type === 'run' ? '100m' : type === 'jump' ? 'Longueur' : 'Poids'}
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {type === 'exercise' ? 'Charge (kg)' : type === 'run' ? 'Temps (s)' : 'Distance (m)'}
            </label>
            <input
              id="value"
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              placeholder="100.0"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex space-x-3 pt-6">
            <button
              type="submit"
              className="flex-1 bg-accent-500 hover:bg-accent-600 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};