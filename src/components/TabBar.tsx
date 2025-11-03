import React, { useState } from 'react';
import { Home, Users, MessageSquare, Lightbulb, Apple, Plus, Dumbbell, Activity, Calendar, Utensils, Bed, Trophy } from 'lucide-react';
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
    { view: 'workouts' as View, icon: Activity, label: 'Entraînements' },
    null, // Placeholder for the FAB
    { view: 'nutrition' as View, icon: Apple, label: 'Nutrition' },
    { view: 'ai' as View, icon: Lightbulb, label: 'Conseil' },
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
  ];

  const handleFabActionClick = (view: View) => {
    onFabAction(view);
    setFabOpen(false);
  };

  const navItems = userRole === 'coach' ? coachNavItems : athleteNavItems;

  return (
    <>
      {isFabOpen && userRole === 'athlete' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-3 z-40">
          {fabActions.map((action) => (
            <button
              key={action.view}
              onClick={() => handleFabActionClick(action.view)}
              className="group flex items-center"
            >
              <span className="mr-3 px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm">
                {action.label}
              </span>
              <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center shadow-md">
                <action.icon size={24} className="text-gray-600 dark:text-gray-200" />
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 flex justify-around items-center z-50">
        {navItems.map((item, index) =>
          item ? (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                currentView === item.view
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300'
              }`}
            >
              <item.icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
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
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform ${
              isFabOpen
                ? 'bg-red-500 rotate-45'
                : 'bg-blue-600'
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