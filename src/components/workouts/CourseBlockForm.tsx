import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimePicker from '../common/TimePicker';
import PickerWheel from '../common/PickerWheel';
import { CourseBlock, WorkoutBlock } from '../../types/workout';
import DistanceSelector from '../common/DistanceSelector';
import { ChronoPicker } from '../common/ChronoPicker';

interface CourseBlockFormProps {
  onSave: (newBlock: Omit<WorkoutBlock, 'id'> | WorkoutBlock) => void;
  onCancel: () => void;
  initialData?: CourseBlock;
  isOpen: boolean;
  userRole: 'coach' | 'athlete';
}

const seriesValues = Array.from({ length: 20 }, (_, i) => i + 1);
const repsValues = Array.from({ length: 50 }, (_, i) => i + 1);

const defaultState: Omit<CourseBlock, 'id' | 'chronos'> = {
  type: 'course',
  series: 1,
  reps: 1,
  distance: 400,
  restBetweenReps: '02:00',
  restBetweenSeries: '05:00',
};

export const CourseBlockForm: React.FC<CourseBlockFormProps> = ({ onSave, onCancel, initialData, isOpen, userRole }) => {
  const [block, setBlock] = useState(initialData || { ...defaultState, chronos: [] });
  const isAthlete = userRole === 'athlete';

  useEffect(() => {
    if (isOpen) {
      const data = initialData || { ...defaultState, chronos: [] };
      setBlock(data);
    }
  }, [initialData, isOpen]);

  // Met à jour la structure des chronos lorsque les séries/réps changent
  useEffect(() => {
    if (isAthlete) {
      const { series, reps, chronos = [] } = block;
      const newChronos = Array(series).fill(null).map((_, sIdx) =>
        Array(reps).fill(null).map((_, rIdx) => 
          chronos[sIdx]?.[rIdx] || null
        )
      );
      // Compare pour éviter une boucle de re-rendu infinie
      if (JSON.stringify(chronos) !== JSON.stringify(newChronos)) {
        setBlock(prev => ({ ...prev, chronos: newChronos }));
      }
    }
  }, [block.series, block.reps, isAthlete]);

  const updateBlock = (updatedFields: Partial<Omit<CourseBlock, 'id'>>) => {
    setBlock(prev => ({ ...prev, ...updatedFields }));
  };

  const handleChronoChange = (serieIndex: number, repIndex: number, value: number | null) => {
    const newChronos = JSON.parse(JSON.stringify(block.chronos || []));
    newChronos[serieIndex][repIndex] = value;
    updateBlock({ chronos: newChronos });
  };

  const handleValidate = () => {
    onSave(block);
  };

  const renderChronoInputs = () => (
    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white">Chronos</h3>
      {Array.from({ length: block.series }).map((_, serieIndex) => (
        <div key={serieIndex} className="p-3 border rounded-lg dark:border-gray-600">
          <h4 className="font-medium mb-2 text-blue-500">Série {serieIndex + 1}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: block.reps }).map((_, repIndex) => (
              <ChronoPicker
                key={repIndex}
                label={`Rép ${repIndex + 1}`}
                initialValue={block.chronos?.[serieIndex]?.[repIndex] || null}
                onChange={(val) => handleChronoChange(serieIndex, repIndex, val)}
              />
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
                {initialData ? 'Modifier le bloc Course' : 'Ajouter un bloc Course'}
              </h3>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* --- Structure Form --- */}
              <div className="grid grid-cols-2 gap-4">
                <PickerWheel label="Séries" values={seriesValues} initialValue={block.series} onChange={(val) => updateBlock({ series: val as number })} />
                <PickerWheel label="Répétitions" values={repsValues} initialValue={block.reps} onChange={(val) => updateBlock({ reps: val as number })} />
              </div>
              <DistanceSelector initialValue={block.distance} onChange={(val) => updateBlock({ distance: val })} />
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

              {/* --- Chrono Inputs for Athlete --- */}
              {isAthlete && renderChronoInputs()}
            </div>

            <div className="flex gap-3 p-6 mt-auto border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={onCancel} className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-medium">
                Annuler
              </button>
              <button type="button" onClick={handleValidate} className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-white font-medium">
                {initialData ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};