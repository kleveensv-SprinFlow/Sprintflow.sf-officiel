import React from 'react';
import { motion } from 'framer-motion';
import { coachActions, ActionType } from '../../data/actions';
import { ChevronRight, AlertCircle, Clock } from 'lucide-react';

interface CoachHubViewProps {
  onAction: (action: ActionType) => void;
}

// Simulation de notifications pour montrer la valeur de la vue liste
// À terme, ces données viendront de vos hooks (useCoachDashboard, etc.)
const mockNotifications: Record<string, { count: number; type: 'alert' | 'warning' | 'info' }> = {
  'my-athletes': { count: 3, type: 'alert' }, // Ex: 3 athlètes en fatigue élevée
  'weekly-planning': { count: 1, type: 'warning' }, // Ex: 1 séance non validée
};

const CoachHubView: React.FC<CoachHubViewProps> = ({ onAction }) => {
  const actions = coachActions;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  };

  return (
    <div className="flex flex-col w-full p-4 relative min-h-[calc(100vh-140px)] bg-gray-50 dark:bg-gray-900">
      
      {/* En-tête simple et pro */}
      <div className="mb-6 mt-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Hub Coach
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Gérez votre équipe et vos stratégies.
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
              className="w-full relative group overflow-hidden bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-sprint-primary/50 dark:hover:border-sprint-primary/50 transition-all duration-300 text-left"
            >
              {/* Effet de fond au survol */}
              <div className="absolute inset-0 bg-gradient-to-r from-sprint-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center space-x-5">
                  {/* Icône avec fond coloré */}
                  <div className={`p-3.5 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    notification?.type === 'alert' 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 group-hover:bg-sprint-primary group-hover:text-white'
                  }`}>
                    <action.Icon size={26} />
                  </div>

                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-sprint-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-[200px] sm:max-w-xs leading-tight mt-1">
                      {action.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Badge de Notification */}
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

                  <ChevronRight 
                    size={20} 
                    className="text-gray-300 group-hover:text-sprint-primary transform group-hover:translate-x-1 transition-all" 
                  />
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Footer informatif discret */}
      <div className="mt-auto py-6 text-center">
        <p className="text-xs text-gray-400 font-medium">
          SprintFlow Coach Pro v1.2
        </p>
      </div>
    </div>
  );
};

export default CoachHubView;