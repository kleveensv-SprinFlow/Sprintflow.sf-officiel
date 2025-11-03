import React from 'react';
import { Navigation } from 'lucide-react';
import { NumberStepper } from '../common/NumberStepper';
import TimePicker from '../common/TimePicker';

import { CourseBlock } from '../../types/workout';

export type CourseBlockData = CourseBlock;

interface CourseBlockFormProps {
  block: CourseBlockData;
  onChange: (updatedBlock: CourseBlockData) => void;
}

export const CourseBlockForm: React.FC<CourseBlockFormProps> = ({ block, onChange }) => {

  const updateBlock = (updatedFields: Partial<CourseBlockData>) => {
    onChange({ ...block, ...updatedFields });
  };

  return (
    <div className="space-y-4 md:pl-16 md:pr-12">
      <h4 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-2">
        <Navigation className="w-5 h-5" />
        <span>Bloc Course / Piste</span>
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
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
          max={50}
        />
        <NumberStepper
          label="Distance"
          value={block.distance}
          onChange={(val) => updateBlock({ distance: val })}
          min={50}
          max={10000}
          step={50}
          suffix="m"
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
    </div>
  );
};

export default CourseBlockForm;