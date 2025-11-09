import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users, MessageSquare, Lightbulb, Apple, Plus, Dumbbell, Activity, Calendar, Utensils, Bed, Trophy, Share } from 'lucide-react';
import { View } from '../types';

interface TabBarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onFabAction: (view: View) => void;
  isFabOpen: boolean;
  setFabOpen: (open: boolean) => void;
  userRole?: 'athlete' | 'coach';
}

const TabBar: React.FC<TabBarProps> = ({ currentView, setCurrentView, onFabAction, isFabOpen, setFabOpen, userRole = 'athlete' }) => {

  const athleteNavItems = [
    { view: 'dashboard' as View, icon: Home, label: 'Accueil' },
    { view: 'workouts' as View, icon: Calendar, label: 'Calendrier' },
    null, // Placeholder for the FAB
    { view: 'nutrition' as View, icon: Apple, label: 'Nutrition' },
    { view: 'groups' as View, icon: Users, label: 'Groupe' },
  ];

  const coachNavItems = [
    { view: 'dashboard' as View, icon: Home, label: 'Dashboard' },
    { view: 'groups' as View, icon: Users, label: 'Mes Groupes' },
    { view: 'planning' as View, icon: Calendar, label: 'Planning' },
    { view: 'chat' as View, icon: MessageSquare, label: 'Chat' },
  ];
  
  const fabActions = [
    { view: 'add-workout' as View, icon: Dumbbell, label: 'Nouvelle Séance' },
    { view: 'add-record' as View, icon: Trophy, label: 'Ajouter Record' },
    { view: 'add-food' as View, icon: Utensils, label: 'Ajouter Repas' },
    { view: 'sleep' as View, icon: Bed, label: 'Saisir Sommeil' },
    { view: 'share-performance' as View, icon: Share, label: 'Partager un Exploit' },
  ];

  const handleFabActionClick = (view: View) => {
    onFabAction(view);
    setFabOpen(false);
  };

  const navItems = userRole === 'coach' ? coachNavItems : athleteNavItems;

  const menuVariants = {
    open: {
      transition: { staggerChildren: 0.04, delayChildren: 0 }
    },
    closed: {
      transition: { staggerChildren: 0.03, staggerDirection: -1 }
    }
  };

  const buttonVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 }
      }
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 }
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isFabOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
              onClick={() => setFabOpen(false)}
              aria-hidden="true"
            />
            
            {userRole === 'athlete' && (
              <motion.div 
                key="fab-menu"
                className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-3 z-40"
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {fabActions.map((action) => (
                  <motion.button
                    key={action.view}
                    onClick={() => handleFabActionClick(action.view)}
                    className="group flex items-center"
                    variants={buttonVariants}
                  >
                    <span className="mr-3 px-3 py-1.5 text-sm font-semibold text-gray-800 dark:text-white bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-lg shadow-sm border border-white/20 dark:border-white/10">
                      {action.label}
                    </span>
                    <div className="w-12 h-12 card-glass rounded-full flex items-center justify-center shadow-lg">
                      <action.icon size={24} className="text-primary-600 dark:text-primary-400" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg flex justify-around items-center z-50">
        {navItems.map((item) =>
          item ? (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 relative ${
                currentView === item.view
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-300'
              }`}
            >
              <item.icon size={24} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {currentView === item.view && <motion.div layoutId="active-tab-indicator" className="absolute bottom-2 w-5 h-1 bg-primary-500 rounded-full" />}
            </button>
          ) : (
            <div key="fab-placeholder" className="w-full" />
          )
        )}
      </div>
      {userRole === 'athlete' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setFabOpen(!isFabOpen)}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isFabOpen
                ? 'bg-gradient-to-br from-red-500 to-pink-500 rotate-45'
                : 'bg-gradient-to-br from-primary-500 to-accent-500'
            }`}
            aria-label="Ajouter une nouvelle entrée"
          >
            <Plus size={32} />
          </button>
        </div>
      )}
    </>
  );
};

export default TabBar;