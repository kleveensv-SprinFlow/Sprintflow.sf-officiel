import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimePicker from '../common/TimePicker';
import PickerWheel from '../common/PickerWheel';
import { CourseBlock, WorkoutBlock } from '../../types/workout';
import DistanceSelector from '../common/DistanceSelector';
import ChronoInput from './ChronoInput';

interface CourseBlockFormProps {
  onSave: (newBlock: Omit<WorkoutBlock, 'id'> | WorkoutBlock) => void;
  onCancel: () => void;
  initialData?: CourseBlock;
  isOpen: boolean;
  userRole: 'coach' | 'athlete';
}

const seriesOptions = Array.from({ length: 20 }, (_, i) => ({ value: i + 1, label: `${i + 1}` }));
const repsOptions = Array.from({ length: 50 }, (_, i) => ({ value: i + 1, label: `${i + 1}` }));

const defaultState: Omit<CourseBlock, 'id'> = {
  type: 'course',
  series: 1,
  reps: 1,
  distance: 400,
  restBetweenReps: '02:00',
  restBetweenSeries: '05:00',
  chronos: [],
};

export const CourseBlockForm: React.FC<CourseBlockFormProps> = ({ onSave, onCancel, initialData, isOpen, userRole }) => {
  const [block, setBlock] = useState<Omit<CourseBlock, 'id'>>({ ...defaultState });
  const isAthlete = userRole === 'athlete';

  useEffect(() => {
    if (isOpen) {
      const baseData = initialData || defaultState;
      const { series, reps, chronos = [] } = baseData;
      const newChronos = Array(series).fill(null).map((_, sIdx) =>
        Array(reps).fill(null).map((_, rIdx) =>
          chronos[sIdx]?.[rIdx] || null
        )
      );
      setBlock({ ...baseData, chronos: newChronos });
    }
  }, [initialData, isOpen]);

  const updateBlockField = (field: keyof Omit<CourseBlock, 'id'>, value: any) => {
    setBlock(prevBlock => {
      const newBlock = { ...prevBlock, [field]: value };
      if ((field === 'series' || field === 'reps')) {
        const { series, reps, chronos = [] } = newBlock;
        const newChronos = Array(series).fill(null).map((_, sIdx) =>
          Array(reps).fill(null).map((_, rIdx) =>
            chronos[sIdx]?.[rIdx] || null
          )
        );
        newBlock.chronos = newChronos;
      }
      return newBlock;
    });
  };

  const handleChronoChange = (serieIndex: number, repIndex: number, value: number | null) => {
    setBlock(prevBlock => {
      const newChronos = JSON.parse(JSON.stringify(prevBlock.chronos));
      newChronos[serieIndex][repIndex] = value;
      return { ...prevBlock, chronos: newChronos };
    });
  };

  const handleValidate = () => {
    onSave({ ...initialData, ...block });
  };

  const renderChronoInputs = () => (
    <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
      <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white">Chronos</h3>
      {Array.from({ length: block.series }).map((_, serieIndex) => (
        <div key={serieIndex} className="p-4 bg-gray-100 dark:bg-gray-900 rounded-xl">
          <h4 className="font-bold mb-4 text-blue-500 dark:text-blue-400">Série {serieIndex + 1}</h4>
          <div className="space-y-4">
            {Array.from({ length: block.reps }).map((_, repIndex) => (
              <div key={repIndex} className="flex items-center justify-between">
                <label className="text-lg font-medium text-gray-600 dark:text-gray-300">Rép {repIndex + 1}</label>
                <div className="w-32">
                  <ChronoInput
                    value={block.chronos?.[serieIndex]?.[repIndex] || null}
                    onChange={(val) => handleChronoChange(serieIndex, repIndex, val)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col"
            style={{ maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                {isAthlete ? "Compléter le bloc Course" : (initialData ? 'Modifier le bloc Course' : 'Ajouter un bloc Course')}
              </h3>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <PickerWheel label="Séries" options={seriesOptions} value={block.series} onChange={(val) => updateBlockField('series', val)} disabled={isAthlete} />
                <PickerWheel label="Répétitions" options={repsOptions} value={block.reps} onChange={(val) => updateBlockField('reps', val)} disabled={isAthlete} />
              </div>
              <DistanceSelector initialValue={block.distance} onChange={(val) => updateBlockField('distance', val)} disabled={isAthlete} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-center text-gray-700 dark:text-gray-300 mb-2">Repos Répétitions</label>
                  <TimePicker initialTime={block.restBetweenReps} onChange={(val) => updateBlockField('restBetweenReps', val)} disabled={isAthlete} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-center text-gray-700 dark:text-gray-300 mb-2">Repos Séries</label>
                  <TimePicker initialTime={block.restBetweenSeries} onChange={(val) => updateBlockField('restBetweenSeries', val)} disabled={isAthlete} />
                </div>
              </div>

              {isAthlete && renderChronoInputs()}
            </div>

            <div className="flex gap-3 p-6 mt-auto border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={onCancel} className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-medium">
                Annuler
              </button>
              <button type="button" onClick={handleValidate} className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-white font-medium">
                {isAthlete ? 'Valider' : (initialData ? 'Modifier' : 'Ajouter')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};