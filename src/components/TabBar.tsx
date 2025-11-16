import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Apple, Plus } from 'lucide-react';
import SprintyIcon from './ui/SprintyIcon.tsx';

type Tab = 'accueil' | 'planning' | 'nutrition' | 'sprinty';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onFabClick: () => void;
  showPlanningNotification?: boolean;
  showCoachNotification?: boolean;
}

const tabs = [
  { id: 'accueil', label: 'Accueil', Icon: Home },
  { id: 'planning', label: 'Planning', Icon: Calendar, notification: 'showPlanningNotification' },
  { id: 'nutrition', label: 'Nutrition', Icon: Apple },
  { id: 'sprinty', label: 'Sprinty', Icon: SprintyIcon, notification: 'showCoachNotification' },
];

const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  onFabClick,
  showPlanningNotification = false,
  showCoachNotification = false,
}) => {
  const notificationStatus = { showPlanningNotification, showCoachNotification };

  const renderTab = (tab: typeof tabs[0]) => {
    const isActive = activeTab === tab.id;
    const hasNotification = tab.notification ? notificationStatus[tab.notification as keyof typeof notificationStatus] : false;

    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id as Tab)}
        className="relative flex h-full flex-1 flex-col items-center justify-center gap-1 focus:outline-none"
      >
        {hasNotification && (
          <span className="absolute right-1/2 top-3 h-2.5 w-2.5 translate-x-[20px] rounded-full bg-orange-accent" />
        )}
        <motion.div
          animate={{ scale: isActive ? 1.15 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <tab.Icon
            className={`h-6 w-6 ${isActive ? 'text-sprint-accent' : 'text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary'}`}
            fill={isActive ? 'currentColor' : 'none'}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </motion.div>
        <span className={`text-xs font-medium ${isActive ? 'text-sprint-light-text-primary dark:text-sprint-dark-text-primary' : 'text-transparent'}`}>
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-[84px] p-2">
      <div className="relative flex h-full w-full items-center justify-around rounded-2xl border border-white/10 bg-sprint-light-surface/70 dark:bg-sprint-dark-surface/70 backdrop-blur-2xl">
        {tabs.slice(0, 2).map(renderTab)}
        <div className="w-16"></div> {/* Espace pour le FAB */}
        {tabs.slice(2, 4).map(renderTab)}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[30%] transform">
          <motion.button
            onClick={onFabClick}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-sprint-accent text-white shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Plus className="h-8 w-8" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TabBar;
