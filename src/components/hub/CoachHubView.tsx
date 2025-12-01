import React from 'react';
import { motion } from 'framer-motion';
import { coachActions, ActionType } from '../../data/actions';
import { ChevronRight, AlertCircle, Clock } from 'lucide-react';

interface CoachHubViewProps {
  onAction: (action: ActionType) => void;
}

// Données simulées pour l'effet "Dashboard Pro" (à connecter au backend plus tard)
const mockNotifications: Record<string, { count: number; type: 'alert' | 'warning' | 'info' }> = {
  'my-athletes': { count: 2, type: 'alert' }, 
  'weekly-planning': { count: 1, type: 'warning' }, 
};

const CoachHubView: React.FC<CoachHubViewProps> = ({ onAction }) => {
  const actions = coachActions;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  };

  return (
    <div className="flex flex-col w-full p-4 relative min-h-[calc(100vh-140px)]">
      
      <div className="mb-6 mt-2 px-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Hub Coach
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Tableau de bord haute performance.
        </p>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {actions.map((action) => {
          const notification = mockNotifications[action.id];

          return (
            <motion.button
              key={action.id}
              variants={itemVariants}
              onClick={() => onAction(action.id)}
              className="w-full relative group overflow-hidden bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-700 hover:border-sprint-primary transition-all duration-300 text-left"
            >
              <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center space-x-5">
                  <div className={`p-3.5 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    notification?.type === 'alert' 
                      ? 'bg-red-900/30 text-red-400' 
                      : 'bg-gray-700 text-gray-300 group-hover:bg-sprint-primary group-hover:text-white'
                  }`}>
                    <action.Icon size={26} />
                  </div>

                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-white group-hover:text-sprint-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">
                      {action.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {notification && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      notification.type === 'alert' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {notification.type === 'alert' ? <AlertCircle size={12} /> : <Clock size={12} />}
                      {notification.count}
                    </div>
                  )}
                  <ChevronRight size={20} className="text-gray-500 group-hover:text-sprint-primary transition-colors" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default CoachHubView;