import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Workout, WorkoutBlock } from '../../../types/workout';
import { BlockCockpit } from '../cockpit/BlockCockpit';
import { AthleteBlockInputs } from './AthleteBlockInputs';
import { BlockCardContent } from '../common/BlockCardContent';

interface AthleteValidationModalProps {
  workout: Workout;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (finalBlocks: WorkoutBlock[]) => void;
}

export const AthleteValidationModal: React.FC<AthleteValidationModalProps> = ({
  workout,
  isOpen,
  onClose,
  onValidate,
}) => {
  // Safe extraction of blocks from planned_data
  const getInitialBlocks = (): WorkoutBlock[] => {
    if (!workout.planned_data) return [];
    if (Array.isArray(workout.planned_data)) return workout.planned_data;
    if ('blocs' in workout.planned_data && Array.isArray((workout.planned_data as any).blocs)) {
      return (workout.planned_data as any).blocs;
    }
    return [];
  };

  const [currentBlocks, setCurrentBlocks] = useState<WorkoutBlock[]>(getInitialBlocks());
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // We need to match the editing block by ID to both current and planned arrays
  const editingBlock = useMemo(() => 
    currentBlocks.find(b => b.id === editingBlockId) || null, 
  [currentBlocks, editingBlockId]);

  const plannedEditingBlock = useMemo(() => {
    const blocks = getInitialBlocks();
    return blocks.find(b => b.id === editingBlockId) || null;
  }, [workout.planned_data, editingBlockId]);

  if (!isOpen) return null;

  const handleBlockUpdate = (updatedBlock: WorkoutBlock) => {
    setCurrentBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
  };

  const handleCloseCockpit = () => {
    setEditingBlockId(null);
  };

  // Error boundary protection
  if (!Array.isArray(currentBlocks)) {
    console.error("AthleteValidationModal: currentBlocks is not an array", currentBlocks);
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={24} />
        </button>
        <div className="flex flex-col items-center">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{workout.title || 'Séance'}</h2>
            <span className="text-xs text-sprint-primary uppercase font-bold tracking-widest">Mission en cours</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Content - Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                Tapez sur un bloc pour ajuster vos performances si elles diffèrent du plan.
            </p>
            
            <div className="space-y-3 pb-16">
              {currentBlocks.map((block) => (
                <motion.div
                  key={block.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingBlockId(block.id)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 cursor-pointer"
                >
                  <BlockCardContent block={block} />
                </motion.div>
              ))}
            </div>
        </div>
      </div>

      {/* Footer - Mission Accomplished Button */}
      <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-area-bottom">
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onValidate(currentBlocks)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sprint-primary to-indigo-600 text-white font-bold text-xl shadow-lg shadow-sprint-primary/30 flex items-center justify-center gap-3"
        >
            <Check size={28} strokeWidth={3} />
            MISSION ACCOMPLIE
        </motion.button>
      </div>

      {/* Editor Drawer */}
      <BlockCockpit 
        isOpen={!!editingBlock}
        block={editingBlock}
        onUpdate={handleBlockUpdate} // Not used directly, passing changes via local state in inputs
        onClose={handleCloseCockpit}
      >
        {editingBlock && plannedEditingBlock && (
             <AthleteBlockInputs 
                block={editingBlock}
                plannedBlock={plannedEditingBlock}
                onChange={handleBlockUpdate}
             />
        )}
      </BlockCockpit>
    </div>
  );
};
