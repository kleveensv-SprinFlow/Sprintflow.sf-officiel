import React, { useState, useMemo, useEffect } from 'react';
import { useExercices } from '../../hooks/useExercices';
import TimePicker from '../common/TimePicker';
import PickerWheel from '../common/PickerWheel';
import { EXERCISE_CATEGORIES } from '../../data/categories';
import { MuscuBlock, WorkoutBlock } from '../../types/workout';

interface MuscuBlockFormProps {
  onAddBlock: (newBlock: Omit<WorkoutBlock, 'id'> | WorkoutBlock) => void;
  onCancel: () => void;
  initialData?: MuscuBlock;
}

const seriesValues = Array.from({ length: 20 }, (_, i) => i + 1);
const repsValues = Array.from({ length: 50 }, (_, i) => i + 1);
const poidsValues = Array.from({ length: 401 }, (_, i) => i * 0.5);

const defaultState: Omit<MuscuBlock, 'id'> = {
  type: 'musculation',
  exerciceId: '',
  exerciceNom: '',
  series: 3,
  reps: 10,
  poids: 50,
  restTime: '02:00',
};

export const MuscuBlockForm: React.FC<MuscuBlockFormProps> = ({ onAddBlock, onCancel, initialData }) => {
  const { exercices } = useExercices();
  const [block, setBlock] = useState(initialData || defaultState);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setBlock(initialData);
      const exo = exercices.find(e => e.id === initialData.exerciceId);
      if (exo) setSelectedCategory(exo.categorie);
    }
  }, [initialData, exercices]);

  const updateBlock = (updatedFields: Partial<Omit<MuscuBlock, 'id'>>) => {
    setBlock(prev => ({ ...prev, ...updatedFields }));
  };
  
  const handleValidate = () => {
    if (!block.exerciceId) {
      alert("Veuillez sélectionner un exercice.");
      return;
    }
    onAddBlock(block);
    if (!initialData) {
      setBlock(defaultState);
      setSelectedCategory('');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    updateBlock({ exerciceId: '', exerciceNom: '' });
  };

  const filteredExercices = useMemo(() => {
    if (!selectedCategory) return [];
    return exercices.filter(ex => ex.categorie === selectedCategory);
  }, [selectedCategory, exercices]);

  return (
    <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catégorie</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full h-11 px-4 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-base font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
          >
            <option value="">Sélectionner une catégorie...</option>
            {EXERCISE_CATEGORIES.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exercice</label>
          <select
            value={block.exerciceId}
            onChange={(e) => {
              const selectedExercice = exercices.find(ex => ex.id === e.target.value);
              updateBlock({
                exerciceId: e.target.value,
                exerciceNom: selectedExercice?.nom || ''
              });
            }}
            className="w-full h-11 px-4 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-base font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
            disabled={!selectedCategory}
          >
            <option value="">Sélectionner un exercice...</option>
            {filteredExercices.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.nom}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <PickerWheel
          label="Séries"
          values={seriesValues}
          initialValue={block.series}
          onChange={(val) => updateBlock({ series: val })}
        />
        <PickerWheel
          label="Répétitions"
          values={repsValues}
          initialValue={block.reps}
          onChange={(val) => updateBlock({ reps: val })}
        />
        <PickerWheel
          label="Poids"
          values={poidsValues}
          initialValue={block.poids}
          onChange={(val) => updateBlock({ poids: val })}
          suffix="kg"
        />
        <div>
          <label className="block text-sm font-medium text-center text-gray-700 dark:text-gray-300 mb-2">Repos</label>
          <TimePicker
            initialTime={block.restTime}
            onChange={(val) => updateBlock({ restTime: val })}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleValidate}
          className="flex-1 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-white font-medium transition-all"
        >
          {initialData ? 'Modifier ce bloc' : 'Ajouter ce bloc'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-all"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};