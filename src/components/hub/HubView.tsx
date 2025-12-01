import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { athleteActions, ActionType } from '../../data/actions';
import HubCard from './HubCard';
import CoachHubView from './CoachHubView'; // Import du nouveau composant

interface HubViewProps {
  onAction: (action: ActionType) => void;
}

const HubView: React.FC<HubViewProps> = ({ onAction }) => {
  const { profile } = useAuth();
  
  // --- LOGIQUE COACH (OPTION 2) ---
  // Si c'est un coach, on retourne directement la vue liste
  if (profile?.role === 'coach') {
    return <CoachHubView onAction={onAction} />;
  }

  // --- LOGIQUE ATHLÈTE (CARROUSEL EXISTANT) ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const actions = athleteActions; // Uniquement les actions athlète ici

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
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
    <div className="flex flex-col w-full pt-4 pb-2 relative overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Fond Athlète */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${actions[currentIndex].image})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 backdrop-blur-3xl bg-black/70 dark:bg-black/80" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Carrousel Athlète */}
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
                <motion.div
                  className="h-full w-full py-2"
                  animate={{
                    scale: isActive ? 1 : 0.92,
                    opacity: isActive ? 1 : 0.4,
                    filter: isActive ? 'blur(0px)' : 'blur(2px)'
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <HubCard action={action} onClick={() => onAction(action.id)} />
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Indicateurs Athlète */}
      <div className="h-8 flex justify-center items-center mt-2 space-x-2 flex-shrink-0 relative z-10">
        {actions.map((_, index) => (
          <motion.div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full cursor-pointer transition-colors duration-300 ${
              currentIndex === index ? 'bg-white' : 'bg-gray-500/50 hover:bg-gray-400'
            }`}
            animate={{ width: currentIndex === index ? 32 : 8, opacity: currentIndex === index ? 1 : 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        ))}
      </div>
    </div>
  );
};

export default HubView;