import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimePicker from '../common/TimePicker';
import PickerWheel from '../common/PickerWheel';
import { CourseBlock, WorkoutBlock } from '../../types/workout';

interface CourseBlockFormProps {
  onSave: (newBlock: Omit<WorkoutBlock, 'id'> | WorkoutBlock) => void;
  onCancel: () => void;
  initialData?: CourseBlock;
  isOpen: boolean;
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

export const CourseBlockForm: React.FC<CourseBlockFormProps> = ({ onSave, onCancel, initialData, isOpen }) => {
  const [block, setBlock] = useState(initialData || defaultState);

  useEffect(() => {
    setBlock(initialData || defaultState);
  }, [initialData, isOpen]);

  const updateBlock = (updatedFields: Partial<Omit<CourseBlock, 'id'>>) => {
    setBlock(prev => ({ ...prev, ...updatedFields }));
  };

  const handleValidate = () => {
    onSave(block);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {initialData ? 'Modifier le bloc Course' : 'Ajouter un bloc Course'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <PickerWheel label="Séries" values={seriesValues} initialValue={block.series} onChange={(val) => updateBlock({ series: val })} />
                <PickerWheel label="Répétitions" values={repsValues} initialValue={block.reps} onChange={(val) => updateBlock({ reps: val })} />
              </div>
              <PickerWheel label="Distance" values={distanceValues} initialValue={block.distance} onChange={(val) => updateBlock({ distance: val })} suffix="m" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-center text-gray-700 dark:text-gray-300 mb-2">Repos Répétitions</label>
                  <TimePicker initialTime={block.restBetweenReps} onChange={(val) => updateBlock({ restBetweenReps: val })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-center text-gray-700 dark:text-gray-300 mb-2">Repos Séries</label>
                  <TimePicker initialTime={block.restBetweenSeries} onChange={(val) => updateBlock({ restBetweenSeries: val })} />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={handleValidate} className="flex-1 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-white font-medium">
                  {initialData ? 'Modifier' : 'Ajouter'}
                </button>
                <button type="button" onClick={onCancel} className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-medium">
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};