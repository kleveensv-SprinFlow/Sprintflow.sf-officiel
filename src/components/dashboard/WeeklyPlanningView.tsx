import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Workout } from '../../types/workout';
import { AthletePlanning } from '../planning/AthletePlanning';

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
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900 z-10">
            <h2 className="text-xl font-bold">{viewMode === 'planned' ? 'Planning' : 'Historique'}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
            <AthletePlanning initialView={viewMode === 'planned' ? 'planning' : 'entrainement'} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WeeklyPlanningView;
