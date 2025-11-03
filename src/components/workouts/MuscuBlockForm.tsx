import React from 'react';
import { Dumbbell } from 'lucide-react';
import { useExercices } from '../../hooks/useExercices';
import { NumberStepper } from '../common/NumberStepper';
import TimePicker from '../common/TimePicker';

import { MuscuBlock } from '../../types/workout';

export type MuscuBlockData = MuscuBlock;

interface MuscuBlockFormProps {
  block: MuscuBlockData;
  onChange: (updatedBlock: MuscuBlockData) => void;
}

export const MuscuBlockForm: React.FC<MuscuBlockFormProps> = ({ block, onChange }) => {
  const { exercices } = useExercices();

  const updateBlock = (updatedFields: Partial<MuscuBlockData>) => {
    onChange({ ...block, ...updatedFields });
  };

  return (
    <div className="space-y-4 md:pl-16 md:pr-12">
      <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center space-x-2">
        <Dumbbell className="w-5 h-5" />
        <span>Bloc Musculation / Force</span>
      </h4>
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
        >
          <option value="">Sélectionner un exercice...</option>
          {exercices.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.nom}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
        <NumberStepper
          label="Séries"
          value={block.series}
          onChange={(val) => updateBlock({ series: val })}
          min={1}
          max={20}
        />
        <NumberStepper
          label="Répétitions"
          value={block.reps}
          onChange={(val) => updateBlock({ reps: val })}
          min={1}
          max={100}
        />
        <NumberStepper
          label="Poids"
          value={block.poids}
          onChange={(val) => updateBlock({ poids: val })}
          min={0}
          max={500}
          step={0.5}
          suffix="kg"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Repos
          </label>
          <TimePicker
            initialTime={block.restTime}
            onChange={(val) => updateBlock({ restTime: val })}
          />
        </div>
      </div>
    </div>
  );
};

export default MuscuBlockForm;