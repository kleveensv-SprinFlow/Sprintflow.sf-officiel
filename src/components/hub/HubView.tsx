import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

  const handleDragEnd = (event: any, info: any) => {
    const swipePower = info.offset.x * info.velocity.x;
    
    if (swipePower < -10000) {
      setCurrentIndex(i => Math.min(i + 1, actions.length - 1));
    } else if (swipePower > 10000) {
      setCurrentIndex(i => Math.max(i - 1, 0));
    }
  };

  return (
    // CORRECTION MAJEURE ICI :
    // Au lieu de compter sur le parent (h-full), on force la hauteur mathématiquement.
    // calc(100vh - 140px) = Hauteur écran - Header (~60px) - TabBar (~64px) - Marges.
    // Cela garantit l'effet immersif "GOWOD" quel que soit le reste du code.
    <div 
      className="flex flex-col w-full pt-4 pb-2"
      style={{ height: 'calc(100vh - 140px)' }}
    >
      
      {/* CARROUSEL : flex-1 va maintenant s'étirer pour remplir tout l'espace calculé ci-dessus */}
      <div className="flex-1 w-full overflow-hidden relative z-10">
        <motion.div
          className="flex h-full"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          {actions.map((action, index) => (
            // Chaque carte prend 100% de la largeur
            <div key={index} className="w-full h-full flex-shrink-0 px-4">
              <div className="h-full w-full py-2">
                <HubCard 
                  action={action} 
                  onClick={() => onAction(action.id)}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* INDICATEURS (POINTS) : Placés tout en bas de notre zone calculée */}
      <div className="h-8 flex justify-center items-center mt-2 space-x-2 flex-shrink-0">
        {actions.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full cursor-pointer ${currentIndex === index ? 'bg-sprint-light-text-primary dark:bg-sprint-dark-text-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
            animate={{ scale: currentIndex === index ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HubView;