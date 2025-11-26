import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Workout } from '../../types/workout';

interface WeeklyPlanningViewProps {
  isOpen: boolean;
  onClose: () => void;
  // workouts: Workout[]; // Will be needed later for week navigation
  viewMode: 'planned' | 'completed';
  // initialDate: Date; // Will be needed later
}

const WeeklyPlanningView: React.FC<WeeklyPlanningViewProps> = ({
  isOpen,
  onClose,
  viewMode,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">{viewMode === 'planned' ? 'Planning de la semaine' : 'Historique des entraînements'}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-center text-gray-500">La vue détaillée de la semaine sera implémentée ici.</p>
            {/* Week navigation and workout list will be implemented here */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WeeklyPlanningView;
