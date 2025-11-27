import React, { useEffect } from 'react';
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

  // Retour haptique discret
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }
  }, [activeTab]);

  const sprintyIsActive = activeTab === 'sprinty';

  return (
    // MODIFICATIONS ICI :
    // 1. Suppression de 'border-t' (plus de ligne de séparation)
    // 2. Remplacement de la couleur noire fixe par la couleur du thème : 'dark:bg-sprint-dark-background'
    // 3. Ajout de transparence (/90) et de flou (backdrop-blur-lg) pour que ça se fonde mais reste lisible
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[80px] pb-4 bg-sprint-light-background/90 dark:bg-sprint-dark-background/90 backdrop-blur-lg transition-colors duration-300">
      <div className="flex h-full w-full items-center justify-around max-w-lg mx-auto px-6">
        
        {/* 1. GAUCHE : ACCUEIL */}
        <button
          onClick={() => onTabChange('accueil')}
          className="flex-1 flex flex-col items-center justify-center h-full group outline-none pt-2"
        >
          <div className="relative p-2">
            <Home
              size={28}
              strokeWidth={activeTab === 'accueil' ? 2.5 : 1.5}
              className={`transition-colors duration-200 ${
                activeTab === 'accueil'
                  ? 'text-sprint-light-text-primary dark:text-white' // Utilisation des couleurs du thème
                  : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400'
              }`}
            />
            {activeTab === 'accueil' && (
               <motion.div 
                 layoutId="tabIndicator"
                 className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sprint-light-text-primary dark:bg-white"
               />
            )}
          </div>
        </button>

        {/* 2. CENTRE : HUB */}
        <button
          onClick={() => onTabChange('hub')}
          className="flex-1 flex flex-col items-center justify-center h-full group outline-none pt-2"
        >
          <div className="relative p-2">
            <LayoutGrid
              size={28}
              strokeWidth={activeTab === 'hub' ? 2.5 : 1.5}
              className={`transition-colors duration-200 ${
                activeTab === 'hub'
                  ? 'text-sprint-light-text-primary dark:text-white'
                  : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400'
              }`}
            />
            {activeTab === 'hub' && (
               <motion.div 
                 layoutId="tabIndicator"
                 className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sprint-light-text-primary dark:bg-white"
               />
            )}
          </div>
        </button>

        {/* 3. DROITE : SPRINTY */}
        <div className="flex-1 flex justify-center items-center h-full pt-2">
            <button
                onClick={() => onTabChange('sprinty')}
                className="group outline-none relative"
            >
                <div className={`absolute inset-0 rounded-full border transition-all duration-300 ${
                    sprintyIsActive 
                        ? 'border-sprint-primary/20 scale-110' 
                        : 'border-transparent scale-100'
                }`} />

                <motion.div
                    animate={sprintyIsActive ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-12 h-12"
                >
                    <SprintyAvatar 
                        onClick={() => {}}
                        scale={1}
                    />
                </motion.div>
            </button>
        </div>

      </div>
    </nav>
  );
};

export default TabBar;