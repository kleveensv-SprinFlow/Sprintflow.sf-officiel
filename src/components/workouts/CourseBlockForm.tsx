import React from 'react';
import { Navigation } from 'lucide-react';
import TimePicker from '../common/TimePicker';
import PickerWheel from '../common/PickerWheel';
import { CourseBlock } from '../../types/workout';

export type CourseBlockData = CourseBlock;

interface CourseBlockFormProps {
  block: CourseBlockData;
  onChange: (updatedBlock: CourseBlockData) => void;
  onValidate: () => void;
}

const seriesValues = Array.from({ length: 20 }, (_, i) => i + 1);
const repsValues = Array.from({ length: 50 }, (_, i) => i + 1);
const distanceValues = Array.from({ length: 200 }, (_, i) => (i + 1) * 50);

export const CourseBlockForm: React.FC<CourseBlockFormProps> = ({ block, onChange, onValidate }) => {
  const updateBlock = (updatedFields: Partial<CourseBlockData>) => {
    onChange({ ...block, ...updatedFields });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-center">
        <PickerWheel
          label="Distance"
          values={distanceValues}
          initialValue={block.distance}
          onChange={(val) => updateBlock({ distance: val })}
          suffix="m"
        />
      </div>
      
      <div className="flex justify-center items-start gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Repos entre Répétitions
          </label>
          <TimePicker
            initialTime={block.restBetweenReps}
            onChange={(val) => updateBlock({ restBetweenReps: val })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Repos entre Séries
          </label>
          <TimePicker
            initialTime={block.restBetweenSeries}
            onChange={(val) => updateBlock({ restBetweenSeries: val })}
          />
        </div>
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

export default CourseBlockForm;