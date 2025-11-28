import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AthletePlanning } from '../planning/AthletePlanning';

interface WeeklyPlanningViewProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: 'planned' | 'completed';
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
          className="fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-900 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {viewMode === 'planned' ? 'Planning de la semaine' : 'Historique des entraînements'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <AthletePlanning
              initialView={viewMode === 'planned' ? 'planning' : 'entrainement'}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WeeklyPlanningView;
