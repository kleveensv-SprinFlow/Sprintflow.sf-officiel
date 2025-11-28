import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { WorkoutBlock, CourseBlock, MuscuBlock, RestBlock } from '../../../types/workout';
import { RulerSlider } from './RulerSlider';
import { PickerWheel } from '../../common/PickerWheel'; // Assuming exists or I might need to check if I can reuse PickerWheel or make a simpler select

interface BlockCockpitProps {
  block: WorkoutBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedBlock: WorkoutBlock) => void;
}

export const BlockCockpit: React.FC<BlockCockpitProps> = ({ block, isOpen, onClose, onUpdate }) => {
  if (!block) return null;

  const renderControls = () => {
    switch(block.type) {
      case 'course':
        const courseBlock = block as CourseBlock;
        return (
          <div className="space-y-6">
             {/* Distance Ruler */}
             <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Distance</label>
                 <RulerSlider
                    value={courseBlock.distance}
                    onChange={(val) => onUpdate({ ...courseBlock, distance: val })}
                    step={10}
                    max={5000}
                 />
             </div>

             {/* Series / Reps Row */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Séries</label>
                     <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-100 dark:border-gray-800 justify-center">
                        <button
                            onClick={() => onUpdate({ ...courseBlock, series: Math.max(1, courseBlock.series - 1) })}
                            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center font-bold text-lg text-gray-700"
                        >-</button>
                        <span className="text-xl font-black w-8 text-center">{courseBlock.series}</span>
                        <button
                            onClick={() => onUpdate({ ...courseBlock, series: courseBlock.series + 1 })}
                            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center font-bold text-lg text-sprint-primary"
                        >+</button>
                     </div>
                 </div>
                 <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Répétitions</label>
                     <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-100 dark:border-gray-800 justify-center">
                        <button
                            onClick={() => onUpdate({ ...courseBlock, reps: Math.max(1, courseBlock.reps - 1) })}
                            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center font-bold text-lg text-gray-700"
                        >-</button>
                        <span className="text-xl font-black w-8 text-center">{courseBlock.reps}</span>
                        <button
                            onClick={() => onUpdate({ ...courseBlock, reps: courseBlock.reps + 1 })}
                            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center font-bold text-lg text-sprint-primary"
                        >+</button>
                     </div>
                 </div>
             </div>

             {/* Rest Inputs */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                     <label className="text-xs text-gray-400 font-medium ml-1">Récup (Reps)</label>
                     <input
                        type="text"
                        value={courseBlock.restBetweenReps}
                        onChange={(e) => onUpdate({ ...courseBlock, restBetweenReps: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-lg p-2 text-center font-bold"
                     />
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs text-gray-400 font-medium ml-1">Récup (Séries)</label>
                     <input
                        type="text"
                        value={courseBlock.restBetweenSeries}
                        onChange={(e) => onUpdate({ ...courseBlock, restBetweenSeries: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-lg p-2 text-center font-bold"
                     />
                 </div>
             </div>
          </div>
        );

      case 'repos':
        const restBlock = block as RestBlock;
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Durée (minutes)</label>
                    <RulerSlider
                        value={Math.floor(restBlock.duration / 60)}
                        onChange={(val) => onUpdate({ ...restBlock, duration: val * 60 + (restBlock.duration % 60) })}
                        min={0}
                        max={60}
                        step={1}
                        unit="min"
                    />
                </div>
                {/* Additional seconds slider or simple input could go here */}
            </div>
        );

      default:
        return <div className="p-4 text-center text-gray-500 italic">Édition avancée bientôt disponible pour ce type.</div>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-y-auto"
          >
            {/* Handle & Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 pt-3 pb-4 px-6 border-b border-gray-100 dark:border-gray-700/50 z-10">
                <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white capitalize">
                            {block.type}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono">ID: {block.id.slice(0,8)}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                        <ChevronDown size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Content (Cockpit Controls) */}
            <div className="p-6 pb-12 safe-area-bottom">
                {renderControls()}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
