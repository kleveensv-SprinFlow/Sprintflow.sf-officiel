import React from 'react';
import { motion } from 'framer-motion';
import { Home, LayoutGrid } from 'lucide-react';
import SprintyAvatar from './chat/sprinty/SprintyAvatar';

export type Tab = 'accueil' | 'hub' | 'sprinty';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  userRole?: 'athlete' | 'coach';
}

const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
}) => {

  const tabs = [
    { id: 'accueil', label: 'Accueil', Icon: Home },
    { id: 'hub', label: 'Hub', Icon: LayoutGrid },
  ];

  const renderTab = (tab: typeof tabs[0]) => {
    const isActive = activeTab === tab. id;

    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id as Tab)}
        className="group flex h-full flex-1 flex-col items-center justify-center focus:outline-none"
      >
        <motion.div
          animate={isActive ? { y: -2, scale: 1.05 } : { y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative flex flex-col items-center gap-1"
        >
          <tab.Icon
            className={`h-[28px] w-[28px] transition-colors duration-300 ${
              isActive
                ? 'text-sprint-primary dark:text-white'
                : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
            }`}
            strokeWidth={1. 5}
          />
        </motion.div>
      </button>
    );
  };
  
  const sprintyIsActive = activeTab === 'sprinty';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[64px] pb-1 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/5">
      <div className="flex h-full w-full items-center justify-around px-2 md:px-8 max-w-2xl mx-auto">
        
        {tabs.map(renderTab)}

        <button
            key="sprinty"
            onClick={() => onTabChange('sprinty')}
            className="group flex h-full flex-1 flex-col items-center justify-center focus:outline-none"
        >
             <motion.div
                animate={sprintyIsActive ? { y: -10, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-12 h-12 cursor-pointer"
             >
                <SprintyAvatar 
                  onClick={() => {}}
                  scale={1}
                />
             </motion. div>
        </button>

      </div>
    </nav>
  );
};

export default TabBar;