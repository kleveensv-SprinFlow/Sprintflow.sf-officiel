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
    // CONTENEUR PRINCIPAL : Prend toute la hauteur
    // pb-20 laisse de la place pour la TabBar en bas pour ne pas que les points soient cachés
    <div className="flex flex-col h-full w-full pt-4 pb-24">
      
      {/* ZONE CARROUSEL : flex-1 force cette zone à prendre tout l'espace vertical disponible */}
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
            // Chaque slide prend 100% de la largeur
            // px-4 ajoute une petite marge sur les côtés pour l'esthétique
            <div key={index} className="w-full h-full flex-shrink-0 px-4">
              {/* Le wrapper interne force la HubCard à prendre 100% de la hauteur du parent */}
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

      {/* ZONE INDICATEURS (POINTS) : Sortie du carrousel, placée en bas */}
      <div className="h-8 flex justify-center items-center mt-4 space-x-2 flex-shrink-0">
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