import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Apple, Plus, BrainCircuit, Users } from 'lucide-react';

type Tab = 'accueil' | 'planning' | 'nutrition' | 'groupes' | 'sprinty';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onFabClick: () => void;
  showPlanningNotification?: boolean;
  showCoachNotification?: boolean;
  userRole?: 'athlete' | 'coach';
}

const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  onFabClick,
  showPlanningNotification = false,
  showCoachNotification = false,
  userRole = 'athlete',
}) => {
  // Configuration pour les athlètes
  const athleteTabs = [
    { id: 'accueil', label: 'Accueil', Icon: Home },
    { id: 'planning', label: 'Planning', Icon: Calendar, notification: 'showPlanningNotification' },
    { id: 'nutrition', label: 'Nutrition', Icon: Apple },
    { id: 'sprinty', label: 'Sprinty', Icon: BrainCircuit, notification: 'showCoachNotification' },
  ];

  // Configuration pour les coachs
  const coachTabs = [
    { id: 'accueil', label: 'Accueil', Icon: Home },
    { id: 'planning', label: 'Planning', Icon: Calendar, notification: 'showPlanningNotification' },
    { id: 'groupes', label: 'Groupes', Icon: Users },
    { id: 'sprinty', label: 'Sprinty', Icon: BrainCircuit, notification: 'showCoachNotification' },
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
          {/* Optional: Label if we want it, but minimal style usually omits it or keeps it very small. 
              The user said "Premium/Intemporel", often no labels or very small ones. 
              I will omit labels for the pure icon bar look, or check if I should include them.
              The previous version didn't show labels either, just icons in the render function.
          */}
        </motion.div>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[84px] pb-5 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/5">
      <div className="flex h-full w-full items-center justify-between px-4 md:px-8 max-w-2xl mx-auto">
        
        {/* Left Tabs */}
        {tabs.slice(0, 2).map(renderTab)}

        {/* Central Action Button (Formerly FAB) */}
        <button
          onClick={onFabClick}
          className="group relative flex h-full flex-1 flex-col items-center justify-center focus:outline-none"
        >
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center rounded-full bg-sprint-primary/10 dark:bg-white/10 p-3 transition-colors duration-300 group-hover:bg-sprint-primary/20 dark:group-hover:bg-white/20"
          >
            <Plus 
              className="h-6 w-6 text-sprint-primary dark:text-white" 
              strokeWidth={2} // Slightly thicker for the main action
            />
          </motion.div>
        </button>

        {/* Right Tabs */}
        {tabs.slice(2, 4).map(renderTab)}
      </div>
    </nav>
  );
};

export default TabBar;
