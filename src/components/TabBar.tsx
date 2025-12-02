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
    // MODIFICATIONS MAJEURES UX/UI:
    // 1. Structure Native : pb-[env(safe-area-inset-bottom)] pour gérer le home indicator iOS
    // 2. Hauteur de contenu fixe (h-[60px]) pour une ergonomie optimale
    // 3. Style Premium Glass : Border-t ultra-fine + Ombre portée diffuse
    // 4. Mode Sombre Forcé : bg-[#0B1120]/90 (couleur dark background par défaut)
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] bg-[#0B1120]/90 backdrop-blur-lg border-t border-white/10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-300">
      <div className="flex h-[60px] w-full items-center justify-around max-w-lg mx-auto px-6">
        
        {/* 1. GAUCHE : ACCUEIL */}
        <button
          onClick={() => onTabChange('accueil')}
          className="flex-1 flex flex-col items-center justify-center h-full group outline-none active:scale-90 transition-transform duration-100"
        >
          <div className="relative p-2">
            <Home
              size={26}
              strokeWidth={activeTab === 'accueil' ? 2.5 : 2}
              className={`transition-colors duration-200 ${
                activeTab === 'accueil'
                  ? 'text-white' 
                  : 'text-gray-500 group-hover:text-gray-300'
              }`}
            />
            {activeTab === 'accueil' && (
               <motion.div 
                 layoutId="tabIndicator"
                 className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
               />
            )}
          </div>
        </button>

        {/* 2. CENTRE : HUB */}
        <button
          onClick={() => onTabChange('hub')}
          className="flex-1 flex flex-col items-center justify-center h-full group outline-none active:scale-90 transition-transform duration-100"
        >
          <div className="relative p-2">
            <LayoutGrid
              size={26}
              strokeWidth={activeTab === 'hub' ? 2.5 : 2}
              className={`transition-colors duration-200 ${
                activeTab === 'hub'
                  ? 'text-white'
                  : 'text-gray-500 group-hover:text-gray-300'
              }`}
            />
            {activeTab === 'hub' && (
               <motion.div 
                 layoutId="tabIndicator"
                 className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
               />
            )}
          </div>
        </button>

        {/* 3. DROITE : SPRINTY (IA) */}
        <div className="flex-1 flex justify-center items-center h-full">
            <button
                onClick={() => onTabChange('sprinty')}
                className="group outline-none relative active:scale-95 transition-transform duration-100"
            >
                {/* Animation de "Respiration" (Pulsation) quand inactif */}
                {!sprintyIsActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-sprint-primary/20 blur-md"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Cercle indicateur actif */}
                <div className={`absolute inset-0 rounded-full border transition-all duration-300 ${
                    sprintyIsActive 
                        ? 'border-sprint-primary/50 scale-110 shadow-[0_0_15px_rgba(124,109,242,0.3)]' 
                        : 'border-transparent scale-100'
                }`} />

                {/* Avatar Sprinty */}
                <motion.div
                    animate={sprintyIsActive ? { scale: 1.05 } : { scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-10 h-10"
                >
                    <SprintyAvatar 
                        onClick={() => {}}
                        scale={0.85} // Légèrement réduit pour s'adapter à la nouvelle hauteur
                    />
                </motion.div>
            </button>
        </div>

      </div>
    </nav>
  );
};

export default TabBar;