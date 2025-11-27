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

  const actions = profile?.role === 'coach' ?  coachActions : athleteActions;

  const handleDragEnd = (event: any, info: any) => {
    const swipePower = info.offset.x * info.velocity. x;
    
    if (swipePower < -10000) {
      setCurrentIndex(i => Math.min(i + 1, actions.length - 1));
    } else if (swipePower > 10000) {
      setCurrentIndex(i => Math.max(i - 1, 0));
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center relative">
      {/* Carousel Container */}
      <div className="w-full h-full max-w-md mx-auto overflow-hidden">
        <motion.div
          className="flex h-full items-center"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          {actions.map((action, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 p-4">
              <HubCard 
                action={action} 
                onClick={() => onAction(action. id)}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 flex space-x-2">
        {actions.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full cursor-pointer ${currentIndex === index ? 'bg-sprint-light-text-primary dark:bg-sprint-dark-text-primary' : 'bg-gray-400 dark:bg-gray-600'}`}
            animate={{ scale: currentIndex === index ? 1.2 : 1 }}
            transition={{ duration: 0. 2 }}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HubView;