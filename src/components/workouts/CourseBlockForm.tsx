import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
  const [view, setView] = useState<'structure' | 'chronos'>('structure');
  const [currentSerieIndex, setCurrentSerieIndex] = useState(0);
  const isAthlete = userRole === 'athlete';

  useEffect(() => {
    if (isOpen) {
      const data = initialData || { ...defaultState, chronos: [] };
      setBlock(data);
      // Pour l'athlète comme pour le coach, on commence toujours par la vue structure
      // pour permettre la modification des paramètres avant la saisie des temps.
      setView('structure');
      setCurrentSerieIndex(0);
    }
  }, [initialData, isOpen]);

  const updateBlock = (updatedFields: Partial<Omit<CourseBlock, 'id'>>) => {
    setBlock(prev => ({ ...prev, ...updatedFields }));
  };

  const handleChronoChange = (serieIndex: number, repIndex: number, value: number | null) => {
    // Crée une copie profonde pour éviter les mutations directes
    const newChronos = JSON.parse(JSON.stringify(block.chronos || []));
    // S'assure que le tableau de la série existe
    while (newChronos.length <= serieIndex) {
      newChronos.push([]);
    }
    newChronos[serieIndex][repIndex] = value;
    updateBlock({ chronos: newChronos });
  };

  const goToChronoView = () => {
    // Initialise ou réinitialise la structure des chronos en fonction des séries/reps actuelles
    const { series, reps } = block;
    const currentChronos = block.chronos || [];
    const newChronos = Array(series).fill(null).map((_, sIdx) => 
      Array(reps).fill(null).map((_, rIdx) => 
        currentChronos[sIdx]?.[rIdx] || null
      )
    );
    setBlock(prev => ({ ...prev, chronos: newChronos }));
    setView('chronos');
  };

  const handleValidate = () => {
    onSave(block);
    setView('structure'); // Réinitialise la vue pour la prochaine ouverture
  };

  const renderStructureForm = () => (
    <>
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
    </>
  );

  const renderAthleteChronoForm = () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="font-semibold text-lg">{block.series} x {block.reps} x {block.distance}m</p>
        <p className="text-blue-500 font-bold text-xl">Série {currentSerieIndex + 1} / {block.series}</p>
      </div>
      <motion.div
        key={currentSerieIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="space-y-3 p-1 max-h-72 overflow-y-auto"
      >
        {Array.from({ length: block.reps }).map((_, repIndex) => (
          <ChronoPicker
            key={repIndex}
            label={`Répétition ${repIndex + 1}`}
            initialValue={block.chronos?.[currentSerieIndex]?.[repIndex] || null}
            onChange={(val) => handleChronoChange(currentSerieIndex, repIndex, val)}
          />
        ))}
      </motion.div>
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => setCurrentSerieIndex(i => i - 1)}
          disabled={currentSerieIndex === 0}
          className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
        >
          <ArrowLeft size={20} />
        </button>
        {currentSerieIndex < block.series - 1 ? (
          <button
            onClick={() => setCurrentSerieIndex(i => i + 1)}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-2"
          >
            Série Suivante <ArrowRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleValidate}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl"
          >
            Valider les chronos
          </button>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (isAthlete && view === 'chronos') {
      return renderAthleteChronoForm();
    }
    return renderStructureForm();
  };
  
  const getModalTitle = () => {
    if (isAthlete) {
      return view === 'chronos' ? 'Saisir les chronos' : 'Définir le bloc Course';
    }
    return initialData ? 'Modifier le bloc Course' : 'Ajouter un bloc Course';
  };

  const renderButtons = () => {
    if (isAthlete && view === 'structure') {
      return (
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onCancel} className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-medium">Annuler</button>
          <button type="button" onClick={goToChronoView} className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-white font-medium">
            {initialData ? 'Saisir les chronos' : 'Suivant'}
          </button>
        </div>
      );
    }
    if (isAthlete && view === 'chronos') {
      return null;
    }
    return (
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-medium">Annuler</button>
        <button type="button" onClick={handleValidate} className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-white font-medium">
          {initialData ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    );
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                {getModalTitle()}
              </h3>
              {renderContent()}
              {renderButtons()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};