// src/components/dashboard/AthleteDailyPlanCarousel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Workout } from '../../types';
import { DayCard } from '../common/DayCard';
import { groupWorkoutsByDay } from '../../utils/groupWorkoutsByDay';
import { addDays, subDays, format, isToday } from 'date-fns';

export const AthleteDailyPlanCarousel: React.FC = () => {
  const { workouts, loading, error } = useWorkouts();
  const [dailyWorkouts, setDailyWorkouts] = useState<Record<string, Workout[]>>({});
  const [dateRange, setDateRange] = useState<Date[]>([]);
  
  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Génère une plage de 7 jours (3 avant aujourd'hui, aujourd'hui, 3 après)
    const today = new Date();
    const range = Array.from({ length: 7 }, (_, i) => subDays(today, 3 - i));
    setDateRange(range);
    
    // Fait défiler le carrousel pour centrer la vue sur "Aujourd'hui" au chargement
    setTimeout(() => {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 100);

  }, []);

  useEffect(() => {
    if (workouts) {
      const plannedWorkouts = workouts.filter(w => w.status === 'planned');
      setDailyWorkouts(groupWorkoutsByDay(plannedWorkouts));
    }
  }, [workouts]);

  return (
    <div className="bg-light-card dark:bg-dark-card shadow-card-light dark:shadow-card-dark rounded-2xl p-4 space-y-4">
      <h2 className="text-xl font-bold text-light-title dark:text-dark-title px-2">Mon Planning</h2>
      {loading ? (
        <p className="text-center text-light-label dark:text-dark-label">Chargement du planning...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar space-x-4 pb-2">
          {dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const workoutsForDay = dailyWorkouts[dateStr] || [];
            const isCurrentDay = isToday(date);

            return (
              <div
                key={dateStr}
                ref={isCurrentDay ? todayRef : null}
                className="snap-center flex-shrink-0 w-[85%]"
              >
                <DayCard date={date} workouts={workoutsForDay} isReadOnly />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};