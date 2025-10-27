import React, { useState } from 'react';
import { Trophy, Search } from 'lucide-react';
import { Record } from '../../types';
import { WindSelector } from '../WindSelector';
import { useExercices, CATEGORIES } from '../../hooks/useExercices';

interface RecordsFormProps {
  records: Record[];
  onSave: (record: Omit<Record, 'id'>) => void;
  onCancel: () => void;
}

export const RecordsForm: React.FC<RecordsFormProps> = ({ records, onSave, onCancel }) => {
  const [type, setType] = useState<'run' | 'exercise' | 'jump' | 'throw'>('exercise');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timingMethod, setTimingMethod] = useState<'manual' | 'automatic'>('manual');
  const [distanceMethod, setDistanceMethod] = useState<'decameter' | 'theodolite'>('decameter');
  const [windSpeed, setWindSpeed] = useState<number | undefined>(undefined);
  const [isHill, setIsHill] = useState(false);
  const [hillLocation, setHillLocation] = useState('');
  const [shoeType, setShoeType] = useState<'spikes' | 'sneakers'>('spikes');

  const [selectedCategorie, setSelectedCategorie] = useState<string>('');
  const [selectedExerciceId, setSelectedExerciceId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { exercices, loading, getExercicesByCategorie, searchExercices, getExerciceById } = useExercices();

  const handleCategorieChange = (cat: string) => {
    setSelectedCategorie(cat);
    setSelectedExerciceId('');
    setSearchQuery('');
    setName('');
  };

  const handleExerciceChange = (exerciceId: string) => {
    setSelectedExerciceId(exerciceId);
    const exercice = getExerciceById(exerciceId);
    if (exercice) {
      setName(exercice.nom);
    }
  };

  const filteredExercices = type === 'exercise' && selectedCategorie
    ? searchQuery
      ? searchExercices(searchQuery, selectedCategorie)
      : getExercicesByCategorie(selectedCategorie)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !value || !date) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (type === 'exercise' && !selectedExerciceId) {
      alert('Veuillez sélectionner un exercice dans la liste');
      return;
    }

    const record: Omit<Record, 'id'> = {
      type,
      name,
      value: parseFloat(value),
      unit: type === 'run' ? 's' : (type === 'jump' || type === 'throw') ? 'm' : 'kg',
      date,
      ...(type === 'run' && { timing_method: timingMethod }),
      ...((type === 'jump' || type === 'throw') && { distance_method: distanceMethod }),
      ...((type === 'run' || type === 'jump' || type === 'throw') && windSpeed !== undefined && { wind_speed: windSpeed }),
      ...(type === 'run' && isHill && { is_hill: true }),
      ...(type === 'run' && isHill && hillLocation && { hill_location: hillLocation }),
      ...(type === 'run' && { shoe_type: shoeType }),
      ...(type === 'exercise' && selectedExerciceId && { exercice_id: selectedExerciceId }),
    };

    onSave(record);

    setName('');
    setValue('');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedCategorie('');
    setSelectedExerciceId('');
    setSearchQuery('');
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'run': return 'Course';
      case 'exercise': return 'Musculation';
      case 'jump': return 'Saut';
      case 'throw': return 'Lancer';
      default: return t;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Trophy className="h-6 w-6 mr-2 text-accent-500" />
          Nouveau record
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de record
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as any);
                setName('');
                setSelectedCategorie('');
                setSelectedExerciceId('');
              }}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rechercher un exercice
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tapez pour filtrer..."
                        className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exercice
                    </label>
                    <select
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
                          {ex.nom_alternatif.length > 0 && ` (${ex.nom_alternatif[0]})`}
                        </option>
                      ))}
                    </select>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {type === 'run' ? 'Distance' : 'Nom'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                placeholder={type === 'run' ? '100m' : type === 'jump' ? 'Longueur' : 'Poids'}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {type === 'exercise' ? 'Charge (kg)' : type === 'run' ? 'Temps (s)' : 'Distance (m)'}
            </label>
            <input
              type="number"
              step={type === 'run' ? '0.01' : '0.1'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              placeholder={type === 'exercise' ? '100.0' : type === 'run' ? '10.50' : '7.50'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              required
            />
          </div>

          {type === 'run' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Méthode de chronométrage
                </label>
                <select
                  value={timingMethod}
                  onChange={(e) => setTimingMethod(e.target.value as 'manual' | 'automatic')}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="manual">Manuel</option>
                  <option value="automatic">Automatique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de chaussures
                </label>
                <select
                  value={shoeType}
                  onChange={(e) => setShoeType(e.target.value as 'spikes' | 'sneakers')}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="spikes">Pointes</option>
                  <option value="sneakers">Baskets</option>
                </select>
              </div>

              <WindSelector value={windSpeed} onChange={setWindSpeed} />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isHill"
                  checked={isHill}
                  onChange={(e) => setIsHill(e.target.checked)}
                  className="w-4 h-4 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                />
                <label htmlFor="isHill" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Course en côte
                </label>
              </div>

              {isHill && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lieu de la côte
                  </label>
                  <input
                    type="text"
                    value={hillLocation}
                    onChange={(e) => setHillLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Ex: Stade municipal"
                  />
                </div>
              )}
            </>
          )}

          {(type === 'jump' || type === 'throw') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Méthode de mesure
                </label>
                <select
                  value={distanceMethod}
                  onChange={(e) => setDistanceMethod(e.target.value as 'decameter' | 'theodolite')}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="decameter">Décamètre</option>
                  <option value="theodolite">Théodolite</option>
                </select>
              </div>

              <WindSelector value={windSpeed} onChange={setWindSpeed} />
            </>
          )}

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
