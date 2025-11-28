import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { WorkoutBlock } from '../../../types/workout';

interface BlockCockpitProps {
  isOpen: boolean;
  block: WorkoutBlock | null;
  onUpdate: (updatedBlock: WorkoutBlock) => void;
  onClose: () => void;
  children: React.ReactNode;
}

export function BlockCockpit({ isOpen, block, onClose, children }: BlockCockpitProps) {
  // Animation variants for the bottom drawer
  const drawerVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { 
      y: "0%", 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      y: "100%", 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && block && (
        <>
          {/* Backdrop - lighter than usual to show context behind */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] border-t border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh]"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                onClose();
              }
            }}
          >
            {/* Drag Handle & Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-12"></div> {/* Spacer to center title */}
              
              <div className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing w-full" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {block.type === 'course' && 'Édition Course'}
                  {block.type === 'musculation' && 'Édition Muscu'}
                  {block.type === 'repos' && 'Édition Repos'}
                  {block.type === 'technique' && 'Édition Technique'}
                  {block.type === 'series' && 'Édition Série'}
                </span>
              </div>

              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 pb-12 overflow-x-hidden">
               {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
