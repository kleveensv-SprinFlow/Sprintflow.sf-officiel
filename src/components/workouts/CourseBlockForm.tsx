import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimePicker from '../common/TimePicker';
import PickerWheel from '../common/PickerWheel';
import { CourseBlock, WorkoutBlock } from '../../types/workout';
import { ChronoInput } from './ChronoInput';
import DistanceSelector from '../common/DistanceSelector';

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
    const data = initialData || { ...defaultState, chronos: [] };
    // Pour un athlète, on initialise la matrice des chronos seulement s'il modifie un bloc existant
    if (isAthlete && initialData) {
      const { series, reps, chronos } = data;
      // Si la structure des chronos ne correspond pas au plan, on la réinitialise.
      if (!chronos || chronos.length !== series || (series > 0 && chronos[0]?.length !== reps)) {
        const newChronos = Array(series).fill(null).map(() => Array(reps).fill(null));
        setBlock({ ...data, chronos: newChronos });
        return;
      }
    }
    setBlock(data);
  }, [initialData, isOpen, isAthlete]);

  const updateBlock = (updatedFields: Partial<Omit<CourseBlock, 'id'>>) => {
    setBlock(prev => ({ ...prev, ...updatedFields }));
  };

  const handleChronoChange = (serieIndex: number, repIndex: number, value: number | null) => {
    const newChronos = [...(block.chronos || [])];
    if (!newChronos[serieIndex]) {
      newChronos[serieIndex] = [];
    }
    newChronos[serieIndex][repIndex] = value;
    updateBlock({ chronos: newChronos });
  };

  const handleValidate = () => {
    onSave(block);
  };

  const renderCoachForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <PickerWheel label="Séries" values={seriesValues} initialValue={block.series} onChange={(val) => updateBlock({ series: val })} />
        <PickerWheel label="Répétitions" values={repsValues} initialValue={block.reps} onChange={(val) => updateBlock({ reps: val })} />
      </div>
      
      <DistanceSelector 
        initialValue={block.distance} 
        onChange={(val) => updateBlock({ distance: val })} 
      />

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
    </>
  );

  const renderAthleteForm = () => (
    <div className="space-y-4">
      <div className="text-center font-semibold">{block.series} x {block.reps} x {block.distance}m</div>
      <div className="max-h-60 overflow-y-auto space-y-3 p-1">
        {Array.from({ length: block.series }).map((_, serieIndex) => (
          <div key={serieIndex} className="p-2 border rounded-md dark:border-gray-600">
            <h4 className="font-medium text-sm mb-2">Série {serieIndex + 1}</h4>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: block.reps }).map((_, repIndex) => (
                <ChronoInput
                  key={repIndex}
                  label={`Rep ${repIndex + 1}`}
                  value={block.chronos?.[serieIndex]?.[repIndex] || null}
                  onChange={(val) => handleChronoChange(serieIndex, repIndex, val)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const showChronoForm = isAthlete && !!initialData;
  const modalTitle = showChronoForm 
    ? 'Saisir les chronos' 
    : (initialData ? 'Modifier le bloc Course' : 'Ajouter un bloc Course');
  const buttonText = showChronoForm 
    ? 'Valider les chronos' 
    : (initialData ? 'Modifier' : 'Ajouter');

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
                {modalTitle}
              </h3>

              {showChronoForm ? renderAthleteForm() : renderCoachForm()}

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={onCancel} className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-medium">
                  Annuler
                </button>
                <button type="button" onClick={handleValidate} className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-white font-medium">
                  {buttonText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};