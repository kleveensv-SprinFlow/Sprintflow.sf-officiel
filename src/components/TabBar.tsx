import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Calendar,
  Apple,
  Users,
  Plus,
  Dumbbell,
  Award,
  RadioTower
} from 'lucide-react';

interface TabBarProps {
  userRole?: 'athlete' | 'coach';
}

const TabBar: React.FC<TabBarProps> = ({ userRole = 'athlete' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFabOpen, setFabOpen] = useState(false);

  const athleteNavItems = [
    { path: '/', icon: Home, label: 'Tableau de Bord' },
    { path: '/workouts', icon: Calendar, label: 'Entraînement' },
    null, // Placeholder for the FAB
    { path: '/nutrition', icon: Apple, label: 'Carburant' },
    { path: '/groups', icon: Users, label: 'Communauté' },
  ];

  const fabActions = [
    { path: '/planning/new', icon: Dumbbell, label: 'Ajouter une séance' },
    { path: '/records/new', icon: Award, label: 'Ajouter un record' },
    { path: '/live', icon: RadioTower, label: 'Live' },
  ];

  const navItems = athleteNavItems;

  const handleFabActionClick = (path: string) => {
    navigate(path);
    setFabOpen(false);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const fabContainerVariants = {
    open: {
      transition: {
        staggerChildren: 0.1,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const fabItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
    closed: {
      y: 20,
      opacity: 0,
      scale: 0.8,
    },
  };

  return (
    <>
      <AnimatePresence>
        {isFabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setFabOpen(false)}
          >
            <motion.div
              variants={fabContainerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
            >
              {fabActions.map((action) => (
                <motion.div key={action.path} variants={fabItemVariants} className="flex flex-col items-center">
                  <button
                    onClick={() => handleFabActionClick(action.path)}
                    className="w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 flex items-center justify-center transition-colors"
                  >
                    <action.icon size={24} />
                  </button>
                   <span className="mt-2 text-white text-sm font-bold text-shadow">{action.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-dark-surface flex justify-around items-center shadow-lg z-50 border-t border-gray-200 dark:border-gray-700">
        {navItems.map((item, index) =>
          item ? (
            <button
              key={index}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center transition-colors ${
                isActive(item.path) ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <motion.div animate={{ scale: isActive(item.path) ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }}>
                <item.icon size={24} />
              </motion.div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ) : (
            <button
              key={`fab-${index}`}
              onClick={() => setFabOpen(!isFabOpen)}
              className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center -mt-8 shadow-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={28} className={`transition-transform ${isFabOpen ? 'rotate-45' : ''}`} />
            </button>
          )
        )}
      </div>
    </>
  );
};

export default TabBar;