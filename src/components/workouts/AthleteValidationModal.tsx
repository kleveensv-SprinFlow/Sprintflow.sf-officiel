import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';
import { WorkoutBlock } from '../../types/workout';
import { Workout } from '../../types';
import { BlockCockpit } from './cockpit/BlockCockpit';
import { BlockValidationSwitch } from './cockpit/BlockValidationForms';

interface AthleteValidationModalProps {
  isOpen: boolean;
  workout: Workout | null;
  onClose: () => void;
  onValidate: (actualBlocks: WorkoutBlock[], notes?: string, rpe?: number) => Promise<void>;
}

export const AthleteValidationModal: React.FC<AthleteValidationModalProps> = ({ isOpen, workout, onClose, onValidate }) => {
  // We initialize the "actual" blocks with the planned blocks
  const [actualBlocks, setActualBlocks] = useState<WorkoutBlock[]>([]);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [globalRpe, setGlobalRpe] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when workout opens
  React.useEffect(() => {
    if (isOpen && workout?.planned_data?.blocs) {
      // Deep copy to ensure we don't mutate the original prop reference
      setActualBlocks(JSON.parse(JSON.stringify(workout.planned_data.blocs)));
      setNotes(workout.notes || '');
      setGlobalRpe(workout.rpe || 5);
    }
  }, [isOpen, workout]);

  const handleBlockClick = (block: WorkoutBlock) => {
    setEditingBlockId(block.id);
  };

  const handleUpdateBlock = (updatedBlock: WorkoutBlock) => {
    setActualBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        await onValidate(actualBlocks, notes, globalRpe);
        onClose();
    } catch (e) {
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  const activeBlock = useMemo(() => {
      if (!editingBlockId) return null;
      // We need BOTH the actual block (state) and the planned block (reference)
      const actual = actualBlocks.find(b => b.id === editingBlockId);
      const planned = workout?.planned_data?.blocs.find(b => b.id === editingBlockId);

      return { actual, planned };
  }, [editingBlockId, actualBlocks, workout]);

  // Framer Motion Variants
  const modalVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: "0%", opacity: 1, transition: { type: "spring", damping: 25, stiffness: 200 } },
    exit: { y: "100%", opacity: 0 }
  };

  if (!isOpen || !workout) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
                className="relative w-full max-w-lg h-[95vh] sm:h-[85vh] bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
                            Mission du jour
                        </h2>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{workout.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body - The List of Blocks (The "Plan") */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Instructions */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-start gap-3">
                         <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={18} />
                         <p className="text-sm text-blue-800 dark:text-blue-200">
                             Voici le plan. Cliquez sur un bloc pour ajuster vos performances si elles diffèrent de l'objectif. Sinon, validez directement !
                         </p>
                    </div>

                    <div className="space-y-3">
                        {actualBlocks.map((block) => {
                             // Determine if modified by comparing with planned
                             const planned = workout.planned_data?.blocs.find(b => b.id === block.id);
                             // Simple JSON stringify comparison (imperfect but works for simple objects)
                             const isModified = JSON.stringify(block) !== JSON.stringify(planned);

                             return (
                                 <motion.div
                                    key={block.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleBlockClick(block)}
                                    className={`
                                        p-4 rounded-xl border-2 transition-all cursor-pointer bg-white dark:bg-gray-800 shadow-sm
                                        ${isModified
                                            ? 'border-yellow-400 dark:border-yellow-500 ring-2 ring-yellow-400/20'
                                            : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                        }
                                    `}
                                 >
                                     <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             {/* Icon based on type */}
                                             <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                                                ${block.type === 'course' ? 'bg-sprint-primary' :
                                                  block.type === 'musculation' ? 'bg-purple-500' :
                                                  'bg-gray-400'}
                                             `}>
                                                 {block.type.substring(0,1).toUpperCase()}
                                             </div>
                                             <div>
                                                 <p className="font-bold text-gray-900 dark:text-white capitalize">
                                                     {block.type}
                                                     {block.type === 'musculation' && ` - ${(block as any).exerciceNom || 'Exo'}`}
                                                 </p>
                                                 <p className="text-xs text-gray-500">
                                                     {block.type === 'course' && `${(block as any).distance}m x ${(block as any).reps}`}
                                                     {block.type === 'musculation' && `${(block as any).series} x ${(block as any).reps}`}
                                                 </p>
                                             </div>
                                         </div>

                                         {isModified && (
                                             <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full">
                                                 Modifié
                                             </span>
                                         )}
                                     </div>
                                 </motion.div>
                             );
                        })}
                    </div>

                    {/* Global Note/RPE */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                         <div>
                             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Note globale de la séance</label>
                             <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none"
                                placeholder="Sensations, douleurs, commentaires..."
                                rows={3}
                             />
                         </div>

                         <div>
                             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">RPE Global (Difficulté)</label>
                             <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={globalRpe}
                                    onChange={(e) => setGlobalRpe(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className={`text-2xl font-black ${globalRpe > 7 ? 'text-red-500' : 'text-blue-500'}`}>{globalRpe}</span>
                             </div>
                         </div>
                    </div>

                </div>

                {/* Footer - GIANT BUTTON */}
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-8 sm:pb-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-xl tracking-wide uppercase rounded-2xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 hover:shadow-xl transition-all"
                    >
                        {isSubmitting ? (
                            <span>Validation...</span>
                        ) : (
                            <>
                                <Check size={28} strokeWidth={3} />
                                Mission Accomplie
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Helper Cockpit for Editing Blocks */}
                <BlockCockpit
                    isOpen={!!editingBlockId}
                    block={activeBlock?.actual || null} // pass actual block to edit
                    onUpdate={handleUpdateBlock}
                    onClose={() => setEditingBlockId(null)}
                >
                    {activeBlock && activeBlock.actual && activeBlock.planned && (
                         <BlockValidationSwitch
                            plannedBlock={activeBlock.planned}
                            actualBlock={activeBlock.actual}
                            onUpdate={handleUpdateBlock}
                         />
                    )}
                </BlockCockpit>

            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
