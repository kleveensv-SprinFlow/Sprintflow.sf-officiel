import React from 'react';
import { Navigation } from 'lucide-react';
import TimePicker from '../common/TimePicker';
import PickerWheel from '../common/PickerWheel';
import { CourseBlock } from '../../types/workout';

export type CourseBlockData = CourseBlock;

interface CourseBlockFormProps {
  block: CourseBlockData;
  onChange: (updatedBlock: CourseBlockData) => void;
}

const seriesValues = Array.from({ length: 20 }, (_, i) => i + 1);
const repsValues = Array.from({ length: 50 }, (_, i) => i + 1);
const distanceValues = Array.from({ length: 200 }, (_, i) => (i + 1) * 50);

export const CourseBlockForm: React.FC<CourseBlockFormProps> = ({ block, onChange }) => {
  const updateBlock = (updatedFields: Partial<CourseBlockData>) => {
    onChange({ ...block, ...updatedFields });
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-2 px-4 pt-4 md:px-6">
        <Navigation className="w-5 h-5" />
        <span>Bloc Course / Piste</span>
      </h4>
      
      <div className="flex flex-wrap justify-center items-start gap-4 px-4 md:px-6">
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
          label="Distance"
          values={distanceValues}
          initialValue={block.distance}
          onChange={(val) => updateBlock({ distance: val })}
          suffix="m"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 px-4 pb-4 md:px-6">
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
    </div>
  );
};

export default CourseBlockForm;