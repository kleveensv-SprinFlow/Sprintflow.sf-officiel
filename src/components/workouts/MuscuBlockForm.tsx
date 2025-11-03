import React, { useState, useMemo } from 'react';
import { Dumbbell } from 'lucide-react';
import { useExercices } from '../../hooks/useExercices';
import TimePicker from '../common/TimePicker';
import PickerWheel from '../common/PickerWheel';
import { EXERCISE_CATEGORIES } from '../../data/categories';
import { MuscuBlock } from '../../types/workout';

interface MuscuBlockFormProps {
  block: MuscuBlock;
  onChange: (updatedBlock: MuscuBlock) => void;
  onValidate: () => void;
}

const seriesValues = Array.from({ length: 20 }, (_, i) => i + 1);
const repsValues = Array.from({ length: 50 }, (_, i) => i + 1);
const poidsValues = Array.from({ length: 401 }, (_, i) => i * 0.5);

export const MuscuBlockForm: React.FC<MuscuBlockFormProps> = ({ block, onChange, onValidate }) => {
  const { exercices } = useExercices();
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const updateBlock = (updatedFields: Partial<MuscuBlock>) => {
    onChange({ ...block, ...updatedFields });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    updateBlock({ exerciceId: '', exerciceNom: '' });
  };

  const filteredExercices = useMemo(() => {
    if (!selectedCategory) {
      return exercices;
    }
    return exercices.filter(ex => ex.categorie === selectedCategory);
  }, [selectedCategory, exercices]);

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catégorie</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          >
            <option value="">Toutes les catégories</option>
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
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            disabled={!selectedCategory && filteredExercices.length === 0}
          >
            <option value="">Sélectionner un exercice...</option>
            {filteredExercices.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.nom}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center items-start gap-4">
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
          Repos
        </label>
        <TimePicker
          initialTime={block.restTime}
          onChange={(val) => updateBlock({ restTime: val })}
        />
      </div>
      <button
        type="button"
        onClick={onValidate}
        className="w-full mt-4 py-3 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Valider
      </button>
    </div>
  );
};