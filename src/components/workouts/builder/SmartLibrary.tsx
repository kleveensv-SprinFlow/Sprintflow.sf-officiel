import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface SmartLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (type: 'course' | 'musculation' | 'repos' | 'technique') => void;
}

export const SmartLibrary: React.FC<SmartLibraryProps> = ({ isOpen, onClose, onAddBlock }) => {
  const categories = [
    { id: 'course', label: 'Course', icon: '🏃', color: 'bg-blue-100 text-blue-600' },
    { id: 'musculation', label: 'Musculation', icon: '💪', color: 'bg-orange-100 text-orange-600' },
    { id: 'technique', label: 'Technique', icon: '⚙️', color: 'bg-purple-100 text-purple-600' },
    { id: 'repos', label: 'Repos', icon: '⏱️', color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
           {/* Backdrop - clicking closes library */}
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={onClose}
             className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30"
           />

           {/* Bottom Sheet */}
           <motion.div
             initial={{ y: '100%' }}
             animate={{ y: 0 }}
             exit={{ y: '100%' }}
             transition={{ type: "spring", damping: 25, stiffness: 300 }}
             className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 p-6 pb-8 safe-area-bottom"
           >
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bibliothèque</h3>
                  <button onClick={onClose} className="p-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <X size={18} />
                  </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                  {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                            onAddBlock(cat.id as any);
                            // Optional: Keep library open or close it?
                            // UX: Close it for now to let user edit the block.
                            onClose();
                        }}
                        className="flex flex-col items-center gap-2 group"
                      >
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-active:scale-95 transition-transform ${cat.color}`}>
                              {cat.icon}
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{cat.label}</span>
                      </button>
                  ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-center text-xs text-gray-400 italic">
                      Favoris bientôt disponibles
                  </p>
              </div>
           </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
