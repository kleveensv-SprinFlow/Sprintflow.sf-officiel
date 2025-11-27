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

  // Retour haptique discret (UX fonctionnelle, pas gadget)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }
  }, [activeTab]);

  const sprintyIsActive = activeTab === 'sprinty';

  return (
    // CONTENEUR "TIMELESS" (Intemporel)
    // fixed bottom-0 : Ancré solidement en bas (pas de flottement)
    // w-full : Prend toute la largeur
    // border-t : Une ligne fine de séparation, classique et élégant
    // bg-white/95 : Fond quasi opaque, juste une touche de transparence pour la profondeur
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[80px] pb-4 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-md border-t border-gray-100 dark:border-white/10">
      <div className="flex h-full w-full items-center justify-around max-w-lg mx-auto px-6">
        
        {/* ONGLET 1 : ACCUEIL */}
        <button
          onClick={() => onTabChange('accueil')}
          className="flex-1 flex flex-col items-center justify-center h-full group outline-none pt-2"
        >
          <div className="relative p-2">
            <Home
              size={28}
              // Trait plus fin pour l'élégance, un peu plus épais si actif
              strokeWidth={activeTab === 'accueil' ? 2.5 : 1.5}
              className={`transition-colors duration-200 ${
                activeTab === 'accueil'
                  ? 'text-black dark:text-white' // Contraste maximum (Noir ou Blanc pur)
                  : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400'
              }`}
            />
            {/* Indicateur minimaliste (point) - Optionnel, très "Apple" */}
            {activeTab === 'accueil' && (
               <motion.div 
                 layoutId="tabIndicator"
                 className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black dark:bg-white"
               />
            )}
          </div>
        </button>

        {/* BOUTON CENTRAL : SPRINTY */}
        {/* Intégré dans le flux, pas de dépassement exagéré */}
        <div className="flex-1 flex justify-center items-center h-full pt-2">
            <button
                onClick={() => onTabChange('sprinty')}
                className="group outline-none relative"
            >
                {/* Cercle de contour subtil qui apparait au survol ou si actif */}
                <div className={`absolute inset-0 rounded-full border transition-all duration-300 ${
                    sprintyIsActive 
                        ? 'border-black/10 dark:border-white/20 scale-110' 
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

        {/* ONGLET 2 : HUB */}
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
                  ? 'text-black dark:text-white'
                  : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400'
              }`}
            />
            {activeTab === 'hub' && (
               <motion.div 
                 layoutId="tabIndicator"
                 className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black dark:bg-white"
               />
            )}
          </div>
        </button>

      </div>
    </nav>
  );
};

export default TabBar;