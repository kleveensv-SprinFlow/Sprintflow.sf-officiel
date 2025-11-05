import React, { useState } from 'react';
import TimePicker from '../common/TimePicker';
import PickerWheel from '../common/PickerWheel';
import { CourseBlock, WorkoutBlock } from '../../types/workout';

interface CourseBlockFormProps {
  onAddBlock: (newBlock: Omit<WorkoutBlock, 'id'>) => void;
  onCancel: () => void;
}

const seriesValues = Array.from({ length: 20 }, (_, i) => i + 1);
const repsValues = Array.from({ length: 50 }, (_, i) => i + 1);
const distanceValues = Array.from({ length: 200 }, (_, i) => (i + 1) * 50);

const defaultState: Omit<CourseBlock, 'id'> = {
  type: 'course',
  series: 1,
  reps: 1,
  distance: 400,
  restBetweenReps: '02:00',
  restBetweenSeries: '05:00',
};

export const CourseBlockForm: React.FC<CourseBlockFormProps> = ({ onAddBlock, onCancel }) => {
  const [block, setBlock] = useState(defaultState);

  const updateBlock = (updatedFields: Partial<Omit<CourseBlock, 'id'>>) => {
    setBlock(prev => ({ ...prev, ...updatedFields }));
  };

  const handleValidate = () => {
    onAddBlock(block);
    setBlock(defaultState); 
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
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
      </div>

      <div className="col-span-2">
        <PickerWheel
            label="Distance"
            values={distanceValues}
            initialValue={block.distance}
            onChange={(val) => updateBlock({ distance: val })}
            suffix="m"
          />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-center text-gray-700 dark:text-gray-300 mb-2">
            Repos Répétitions
          </label>
          <TimePicker
            initialTime={block.restBetweenReps}
            onChange={(val) => updateBlock({ restBetweenReps: val })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-center text-gray-700 dark:text-gray-300 mb-2">
            Repos Séries
          </label>
          <TimePicker
            initialTime={block.restBetweenSeries}
            onChange={(val) => updateBlock({ restBetweenSeries: val })}
          />
        </div>
      </div>
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleValidate}
          className="flex-1 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-white font-medium transition-all"
        >
          Ajouter ce bloc
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