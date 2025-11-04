import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Target } from 'lucide-react';
import useExercices from '../../hooks/useExercices';
import useObjectif from '../../hooks/useObjectif';
import useAuth from '../../hooks/useAuth';
import { ExerciceReference, Objectif } from '../../types';
import { toast } from 'react-toastify';
import ChronoInput from '../workouts/ChronoInput'; // Pour la saisie de temps

interface SetObjectifModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export const SetObjectifModal: React.FC<SetObjectifModalProps> = ({ onClose, onSaved }) => {
  const { user } = useAuth();
  const { categories, exercices, loading: loadingExercices } = useExercices();
  const { objectif: currentObjectif, setObjectif, loading: savingObjectif } = useObjectif();
  
  const [selectedCategorie, setSelectedCategorie] = useState<string | null>(null);
  const [selectedExercice, setSelectedExercice] = useState<ExerciceReference | null>(null);
  const [valeur, setValeur] = useState<string>('');

  useEffect(() => {
    if (currentObjectif && currentObjectif.exercice) {
      setSelectedCategorie(currentObjectif.exercice.categorie);
      setSelectedExercice(currentObjectif.exercice);
      setValeur(currentObjectif.valeur.toString());
    }
  }, [currentObjectif]);

  const handleSave = async () => {
    if (!user || !selectedExercice || valeur === '') {
      toast.warn('Veuillez sélectionner un exercice et entrer une valeur.');
      return;
    }
    const numValue = parseFloat(valeur.replace(',', '.'));
    if (isNaN(numValue)) {
      toast.error('La valeur saisie est invalide.');
      return;
    }

    await setObjectif({
      exercice_id: selectedExercice.id,
      valeur: numValue
    }, user.id);
    
    toast.success('Objectif enregistré avec succès !');
    onSaved();
    onClose();
  };

  const renderUnitInput = () => {
    if (!selectedExercice) return null;

    switch (selectedExercice.unite) {
      case 'temps':
        return <ChronoInput value={parseFloat(valeur) || 0} onChange={(newVal) => setValeur(newVal.toString())} />;
      case 'distance':
      case 'poids':
      case 'reps':
      case 'nb':
        return (
          <input
            type="number"
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            placeholder={`Valeur en ${selectedExercice.unite === 'distance' ? 'mètres' : selectedExercice.unite}`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Target /> Définir mon objectif</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
            <select
              value={selectedCategorie || ''}
              onChange={(e) => {
                setSelectedCategorie(e.target.value);
                setSelectedExercice(null);
                setValeur('');
              }}
              className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              <option value="" disabled>Choisir une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          </div>

          {selectedCategorie && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exercice</label>
              <select
                value={selectedExercice?.id || ''}
                onChange={(e) => {
                  const exo = exercices.find(ex => ex.id === e.target.value);
                  setSelectedExercice(exo || null);
                  setValeur('');
                }}
                disabled={!selectedCategorie || loadingExercices}
                className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                <option value="" disabled>Choisir un exercice</option>
                {exercices.filter(ex => ex.categorie === selectedCategorie).map((exo) => (
                  <option key={exo.id} value={exo.id}>{exo.nom}</option>
                ))}
              </select>
            </div>
          )}

          {selectedExercice && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Objectif ({selectedExercice.unite})
              </label>
              {renderUnitInput()}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={savingObjectif}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
          >
            {savingObjectif ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};