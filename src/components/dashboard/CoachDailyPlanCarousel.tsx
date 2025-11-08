// src/components/dashboard/CoachDailyPlanCarousel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Workout } from '../../types';
import { DayCard } from '../common/DayCard';
import { groupWorkoutsByDay } from '../../utils/groupWorkoutsByDay';
import { addDays, format, isToday } from 'date-fns';

type Selection = {
  type: 'athlete' | 'group';
  id: string;
};

interface CoachDailyPlanCarouselProps {
  selection: Selection;
  onPlanWorkout: (date: Date) => void;
  onEditWorkout: (workoutId: string) => void;
  onViewWorkout: (workoutId: string) => void;
}

export const CoachDailyPlanCarousel: React.FC<CoachDailyPlanCarouselProps> = ({ 
  selection, 
  onPlanWorkout, 
  onEditWorkout, 
  onViewWorkout 
}) => {
  const { workouts, loading, error, refresh } = useWorkouts(selection);
  const [dailyWorkouts, setDailyWorkouts] = useState<Record<string, Workout[]>>({});
  const [dateRange, setDateRange] = useState<Date[]>([]);
  
  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Refresh workouts when selection changes
    refresh();
  }, [selection, refresh]);

  useEffect(() => {
    const today = new Date();
    const range = Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));
    setDateRange(range);
  }, []);

  useEffect(() => {
    if (workouts) {
      const plannedWorkouts = workouts.filter(w => w.status === 'planned');
      setDailyWorkouts(groupWorkoutsByDay(plannedWorkouts));
    }
  }, [workouts]);

  useEffect(() => {
    if (!loading && todayRef.current) {
      setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 100);
    }
  }, [loading]);

  return (
    <div>
      {error ? (
        <p className="text-center text-red-500 px-4">{error}</p>
      ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar space-x-4 pb-2 px-4">
          {dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const workoutsForDay = loading ? null : dailyWorkouts[dateStr] || [];
            const isCurrentDay = isToday(date);
            const mainWorkout = workoutsForDay && workoutsForDay.length > 0 ? workoutsForDay[0] : null;

            return (
              <div
                key={dateStr}
                ref={isCurrentDay ? todayRef : null}
                className="snap-center flex-shrink-0 w-[85%] md:w-[45%] lg:w-[30%] h-full"
              >
                {loading ? (
                  <div className="w-full min-h-[250px] rounded-2xl p-4 flex flex-col justify-between bg-light-card dark:bg-dark-card/50 animate-pulse">
                     <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                     <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded mt-1"></div>
                     <div className="self-center h-10 w-1/2 bg-gray-400 dark:bg-gray-700 rounded-lg mt-4"></div>
                  </div>
                ) : (
                  <DayCard 
                    date={date} 
                    workouts={workoutsForDay} 
                    isReadOnly={false}
                    onPlanClick={onPlanWorkout}
                    onCardClick={mainWorkout ? () => onViewWorkout(mainWorkout.id) : undefined}
                    onEditClick={mainWorkout ? () => onEditWorkout(mainWorkout.id) : undefined}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};