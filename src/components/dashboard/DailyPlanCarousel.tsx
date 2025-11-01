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
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 15 }).map((_, i) => {
      const offset = i - 7;
      return addDays(today, offset);
    });
  }, []);

  const todayIndex = useMemo(() => dates.findIndex(isToday), [dates]);
  const [index, setIndex] = useState(todayIndex !== -1 ? todayIndex : 7);

  const workoutsByDate = useMemo(() => {
    const map = new Map<string, Workout>();
    workouts.forEach(w => {
      const dateKey = format(startOfDay(new Date(w.date)), 'yyyy-MM-dd');
      map.set(dateKey, w);
    });
    return map;
  }, [workouts]);

  useEffect(() => {
    if (todayIndex !== -1) {
      setIndex(todayIndex);
    }
  }, [todayIndex]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = CARD_WIDTH / 3;
    const velocityThreshold = 500;

    if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      setIndex(prev => Math.min(prev + 1, dates.length - 1));
    } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      setIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const maxDragDistance = useMemo(() => {
    return (dates.length - 1) * (CARD_WIDTH + GAP);
  }, [dates.length]);

  const calculateOffset = (currentIndex: number) => {
    return -(currentIndex * (CARD_WIDTH + GAP)) + (window.innerWidth / 2) - (CARD_WIDTH / 2);
  };

  return (
    <div className="relative w-full h-[300px] flex items-center overflow-hidden">
      <motion.div
        drag="x"
        dragConstraints={{
          left: -maxDragDistance - (CARD_WIDTH / 2),
          right: (CARD_WIDTH / 2)
        }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className="flex items-center h-full"
        style={{ gap: `${GAP}px` }}
        animate={{
          x: calculateOffset(index),
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
      >
        {dates.map((date, i) => {
          const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
          const workout = workoutsByDate.get(dateKey) || null;
          const distance = Math.abs(i - index);

          return (
            <motion.div
              key={date.toISOString()}
              className="w-72 h-48 shrink-0 cursor-grab active:cursor-grabbing"
              animate={{
                scale: index === i ? 1.05 : 0.92,
                opacity: distance > 2 ? 0.3 : (index === i ? 1 : 0.7),
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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