import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Calendar,
  Apple,
  Users,
  Plus,
} from 'lucide-react';
import { View } from '../types';

interface TabBarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onFabAction: (view: View) => void;
  isFabOpen: boolean;
  setFabOpen: (open: boolean) => void;
  userRole?: 'athlete' | 'coach';
}

const TabBar: React.FC<TabBarProps> = ({
  currentView,
  setCurrentView,
  onFabAction,
  isFabOpen,
  setFabOpen,
  userRole = 'athlete',
}) => {
  const athleteNavItems = [
    { view: 'dashboard', icon: Home, label: 'Accueil' },
    { view: 'workouts', icon: Calendar, label: 'Planning' },
    null, // Placeholder for the FAB
    { view: 'nutrition', icon: Apple, label: 'Nutrition' },
    { view: 'groups', icon: Users, label: 'Groupes' },
  ];

  const fabActions = [
    { view: 'add-workout', icon: Plus, label: 'Nouvelle Séance' },
    // Ajoutez d'autres actions si nécessaire
  ];

  const navItems = athleteNavItems;

  const handleFabActionClick = (view: View) => {
    onFabAction(view);
    setFabOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {/* Bouton principal FAB */}
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
                key={action.view}
                onClick={() => handleFabActionClick(action.view)}
                className="rounded-full p-3 bg-primary-600 text-white"
              >
                <action.icon />
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre de navigation en bas */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white flex justify-around items-center shadow-lg z-50 border-t">
        {navItems.map((item, index) =>
          item ? (
            <button
              key={index}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center ${
                currentView === item.view ? 'text-primary-500' : 'text-gray-500'
              }`}
            >
              <item.icon size={24} />
              <span className="text-xs">{item.label}</span>
            </button>
          ) : (
            <div key={`fab-placeholder-${index}`} className="w-16"></div>
          )
        )}
      </div>
    </>
  );
};

export default TabBar;