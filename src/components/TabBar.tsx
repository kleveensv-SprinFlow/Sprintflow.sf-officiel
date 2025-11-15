import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Calendar,
  Apple,
  Users,
  Plus,
} from 'lucide-react';

interface TabBarProps {
  userRole?: 'athlete' | 'coach';
}

const TabBar: React.FC<TabBarProps> = ({ userRole = 'athlete' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFabOpen, setFabOpen] = useState(false);

  const athleteNavItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/workouts', icon: Calendar, label: 'Planning' },
    null, // Placeholder for the FAB
    { path: '/nutrition', icon: Apple, label: 'Nutrition' },
    { path: '/groups', icon: Users, label: 'Groupes' },
  ];

  const fabActions = [
    { path: '/planning/new', icon: Plus, label: 'Nouvelle Séance' },
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

  return (
    <>
      <AnimatePresence>
        {isFabOpen && (
          <motion.div
            key="fab-menu"
            className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 flex flex-col space-y-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {fabActions.map((action) => (
              <button
                key={action.path}
                onClick={() => handleFabActionClick(action.path)}
                className="rounded-full p-3 bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors"
              >
                <action.icon size={24} />
                <span className="sr-only">{action.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isFabOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setFabOpen(false)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-dark-surface flex justify-around items-center shadow-lg z-50 border-t border-gray-200 dark:border-gray-700">
        {navItems.map((item, index) =>
          item ? (
            <button
              key={index}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center ${
                isActive(item.path) ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <item.icon size={24} />
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
