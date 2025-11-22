import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Apple, Plus, Users, MessageCircle } from 'lucide-react';
import SprintyAvatar from './chat/sprinty/SprintyAvatar';
import { useSprinty } from '../context/SprintyContext';

type Tab = 'accueil' | 'planning' | 'nutrition' | 'groupes' | 'sprinty';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onFabClick: () => void;
  showPlanningNotification?: boolean;
  showCoachNotification?: boolean;
  userRole?: 'athlete' | 'coach';
  isFabOpen?: boolean;
}

const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  onFabClick,
  showPlanningNotification = false,
  showCoachNotification = false,
  userRole = 'athlete',
  isFabOpen = false
}) => {
  const { toggleCharacterSelector } = useSprinty();
  // Configuration pour les athlètes
  const athleteTabs = [
    { id: 'accueil', label: 'Accueil', Icon: Home },
    { id: 'planning', label: 'Planning', Icon: Calendar, notification: 'showPlanningNotification' },
    { id: 'nutrition', label: 'Nutrition', Icon: Apple },
    { id: 'sprinty', label: 'Sprinty', Icon: MessageCircle, notification: 'showCoachNotification' },
  ];

  // Configuration pour les coachs
  const coachTabs = [
    { id: 'accueil', label: 'Accueil', Icon: Home },
    { id: 'planning', label: 'Planning', Icon: Calendar, notification: 'showPlanningNotification' },
    { id: 'groupes', label: 'Groupes', Icon: Users },
    { id: 'sprinty', label: 'Sprinty', Icon: MessageCircle, notification: 'showCoachNotification' },
  ];

  const tabs = userRole === 'coach' ? coachTabs : athleteTabs;
  const notificationStatus = { showPlanningNotification, showCoachNotification };

  const renderTab = (tab: typeof tabs[0]) => {
    const isActive = activeTab === tab.id;
    const hasNotification = tab.notification
      ? notificationStatus[tab.notification as keyof typeof notificationStatus]
      : false;

    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id as Tab)}
        className="group flex h-full flex-1 flex-col items-center justify-center focus:outline-none"
      >
        <motion.div
          animate={isActive ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative flex flex-col items-center gap-1"
        >
          {hasNotification && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
          )}
          <tab.Icon
            className={`h-[26px] w-[26px] transition-colors duration-300 ${
              isActive
                ? 'text-sprint-primary dark:text-white'
                : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
            }`}
            strokeWidth={1.5}
          />
        </motion.div>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[64px] pb-1 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/5">
      <div className="flex h-full w-full items-center justify-between px-4 md:px-8 max-w-2xl mx-auto">
        
        {/* Left Tabs */}
        {tabs.slice(0, 2).map(renderTab)}

        {/* Central Action Button (FAB) or Sprinty Avatar */}
        <div className="group relative flex h-full flex-1 flex-col items-center justify-center focus:outline-none">
          <AnimatePresence mode="wait">
            {activeTab === 'sprinty' ? (
              <motion.div
                key="sprinty"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-16 h-16 -mt-6 cursor-pointer" // Enlarged (w-16 h-16) and lifted more (-mt-6)
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCharacterSelector();
                }}
              >
                <SprintyAvatar 
                  onClick={() => {}} // Handled by parent div to ensure touch target
                  scale={1.3} // Slight increase in internal scale
                />
              </motion.div>
            ) : (
              <motion.button
                key="fab"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={onFabClick}
                className="flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: isFabOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-center rounded-full p-3 transition-colors duration-300 ${
                      isFabOpen 
                      ? 'bg-sprint-primary text-white dark:bg-white dark:text-black'
                      : 'bg-sprint-primary/10 dark:bg-white/10 group-hover:bg-sprint-primary/20 dark:group-hover:bg-white/20'
                  }`}
                >
                  <Plus 
                    className={`h-6 w-6 ${
                        isFabOpen
                        ? 'text-current'
                        : 'text-sprint-primary dark:text-white'
                    }`}
                    strokeWidth={2}
                  />
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Right Tabs */}
        {tabs.slice(2, 4).map(renderTab)}
      </div>
    </nav>
  );
};

export default TabBar;
