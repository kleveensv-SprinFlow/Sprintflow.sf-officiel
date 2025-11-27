import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { athleteActions, coachActions, ActionType } from '../../data/actions';
import HubCard from './HubCard';

interface HubViewProps {
  onAction: (action: ActionType) => void;
}

const HubView: React.FC<HubViewProps> = ({ onAction }) => {
  const { profile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  const actions = profile?.role === 'coach' ? coachActions : athleteActions;

  // 1. RETOUR HAPTIQUE (VIBRATION)
  // Déclenche une vibration subtile à chaque changement de carte
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15); // Vibration courte et nette
    }
  }, [currentIndex]);

  const handleDragEnd = (event: any, info: any) => {
    const swipePower = info.offset.x * info.velocity.x;
    
    if (swipePower < -10000) {
      setCurrentIndex(i => Math.min(i + 1, actions.length - 1));
    } else if (swipePower > 10000) {
      setCurrentIndex(i => Math.max(i - 1, 0));
    }
  };

  return (
    <div 
      className="flex flex-col w-full pt-4 pb-2 relative overflow-hidden"
      style={{ height: 'calc(100vh - 140px)' }}
    >
      
      {/* 2. FOND D'AMBIANCE IMMERSIF */}
      {/* Crée un arrière-plan flou qui change dynamiquement avec l'image active */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${actions[currentIndex].image})`,
            }}
          />
        </AnimatePresence>
        {/* Filtres pour assombrir et flouter l'image de fond afin que le texte reste lisible */}
        <div className="absolute inset-0 backdrop-blur-3xl bg-black/70 dark:bg-black/80" />
        {/* Dégradé supplémentaire en bas pour fondre avec la TabBar */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* CARROUSEL (z-10 pour être au-dessus du fond) */}
      <div className="flex-1 w-full overflow-hidden relative z-10">
        <motion.div
          className="flex h-full"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          {actions.map((action, index) => {
            const isActive = index === currentIndex;
            return (
              <div key={index} className="w-full h-full flex-shrink-0 px-4">
                {/* 3. EFFET FOCUS (SCALE & OPACITY) */}
                <motion.div
                  className="h-full w-full py-2"
                  animate={{
                    // La carte active est à 100%, les autres légèrement réduites
                    scale: isActive ? 1 : 0.92,
                    // Les cartes inactives sont un peu transparentes
                    opacity: isActive ? 1 : 0.4,
                    // Petit flou sur les cartes inactives pour simuler la profondeur de champ
                    filter: isActive ? 'blur(0px)' : 'blur(2px)'
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 30 
                  }}
                >
                  <HubCard 
                    action={action} 
                    onClick={() => onAction(action.id)}
                  />
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* INDICATEURS (PILULES) */}
      <div className="h-8 flex justify-center items-center mt-2 space-x-2 flex-shrink-0 relative z-10">
        {actions.map((_, index) => {
          const isActive = currentIndex === index;
          return (
            <motion.div
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full cursor-pointer transition-colors duration-300 ${
                isActive 
                  ? 'bg-sprint-light-text-primary dark:bg-white' // Blanc pur pour le contraste max
                  : 'bg-gray-500/50 hover:bg-gray-400'
              }`}
              animate={{ 
                width: isActive ? 32 : 8, // Plus large quand actif (32px)
                opacity: isActive ? 1 : 0.5
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25 
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HubView;