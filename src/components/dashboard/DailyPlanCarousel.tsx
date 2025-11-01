// src/components/dashboard/DailyPlanCarousel.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { subDays, addDays, isToday, startOfDay, format } from 'date-fns';
import { DayCard } from '../common/DayCard';
import { Workout } from '../../types';

const CARD_WIDTH = 288; // w-72
const GAP = 16; // gap-4

interface DailyPlanCarouselProps {
  workouts: Workout[];
  onPlanClick: (date: Date) => void;
  onEditClick: (workoutId: string) => void;
}

export const DailyPlanCarousel: React.FC<DailyPlanCarouselProps> = ({ workouts, onPlanClick, onEditClick }) => {
  const [index, setIndex] = useState(0);

  const dates = useMemo(() => {
    const today = new Date();
    // Afficher 7 jours dans le passé et 7 jours dans le futur pour un total de 15 jours
    return Array.from({ length: 15 }).map((_, i) => {
      const offset = i - 7;
      return addDays(today, offset);
    });
  }, []);
  
  const workoutsByDate = useMemo(() => {
    const map = new Map<string, Workout>();
    workouts.forEach(w => {
      const dateKey = format(startOfDay(new Date(w.date)), 'yyyy-MM-dd');
      map.set(dateKey, w);
    });
    return map;
  }, [workouts]);

  useEffect(() => {
    const todayIndex = dates.findIndex(isToday);
    if (todayIndex !== -1) {
      setIndex(todayIndex);
    }
  }, [dates]);
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = CARD_WIDTH / 2;
    const velocityThreshold = 300;

    if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      setIndex(prev => Math.min(prev + 1, dates.length - 1));
    } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      setIndex(prev => Math.max(prev - 1, 0));
    }
  };

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center">
      {/* Effet de fondu sur les côtés */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-gray-100 dark:from-gray-900 via-transparent to-gray-100 dark:to-gray-900" />
      
      <div className="w-full h-full overflow-hidden" style={{ perspective: '1200px' }}>
        <motion.div
          drag="x"
          dragConstraints={{ left: -(dates.length - 1) * (CARD_WIDTH + GAP), right: 0 }}
          onDragEnd={handleDragEnd}
          className="flex items-center h-full"
          style={{ gap: `${GAP}px` }}
          animate={{
            x: `calc(50% - ${index * (CARD_WIDTH + GAP)}px - ${CARD_WIDTH / 2}px)`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 35, mass: 1 }}
        >
          {dates.map((date, i) => {
            const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
            const workout = workoutsByDate.get(dateKey) || null;
            
            return (
              <motion.div
                key={date.toISOString()}
                className="w-72 h-48 shrink-0 cursor-grab active:cursor-grabbing"
                animate={{
                  rotateY: index === i ? 0 : (i < index ? 45 : -45),
                  scale: index === i ? 1.05 : 0.85,
                  opacity: Math.abs(index - i) > 2 ? 0 : (index === i ? 1 : 0.6),
                  zIndex: dates.length - Math.abs(index - i),
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onTap={() => setIndex(i)}
              >
                <DayCard 
                  date={date} 
                  workout={workout}
                  isActive={index === i}
                  onPlanClick={onPlanClick}
                  onEditClick={onEditClick}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};