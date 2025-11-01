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
    // Container simplifié, sans masques ni perspective
    <div className="relative w-full h-[300px] flex items-center overflow-x-hidden">
      <motion.div
        drag="x"
        dragConstraints={{ left: -(dates.length - 1) * (CARD_WIDTH + GAP), right: 0 }}
        onDragEnd={handleDragEnd}
        className="flex items-center h-full"
        style={{ gap: `${GAP}px` }}
        animate={{
          x: `calc(50% - ${index * (CARD_WIDTH + GAP)}px - ${CARD_WIDTH / 2}px)`,
        }}
        // Animation très douce pour un glissement naturel
        transition={{ type: 'spring', stiffness: 150, damping: 25 }}
      >
        {dates.map((date, i) => {
          const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
          const workout = workoutsByDate.get(dateKey) || null;
          
          return (
            <motion.div
              key={date.toISOString()}
              className="w-72 h-48 shrink-0 cursor-grab active:cursor-grabbing"
              // Animation 2D simple avec effet de focus
              animate={{
                scale: index === i ? 1.05 : 0.9,
                opacity: index === i ? 1 : 0.7,
              }}
              // Animation douce pour le changement de focus
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
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
  );
};