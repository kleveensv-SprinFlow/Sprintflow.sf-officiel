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

  // Ce hook s'exécute une seule fois pour définir la plage de dates
  useEffect(() => {
    const today = new Date();
    const range = Array.from({ length: 7 }, (_, i) => subDays(today, 3 - i));
    setDateRange(range);
  }, []);

  // Ce hook met à jour les entraînements quand les données arrivent
  useEffect(() => {
    if (workouts) {
      const plannedWorkouts = workouts.filter(w => w.status === 'planned');
      setDailyWorkouts(groupWorkoutsByDay(plannedWorkouts));
    }
  }, [workouts]);

  // CE HOOK EST LA CORRECTION : il s'exécute quand le chargement est terminé
  // pour garantir que le défilement se fait au bon moment.
  useEffect(() => {
    if (!loading && todayRef.current) {
      // On utilise un court délai pour s'assurer que le navigateur a eu le temps de tout "peindre"
      setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 50);
    }
  }, [loading]); // Se déclenche quand 'loading' change

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-light-title dark:text-dark-title px-4">Mon Planning</h2>
      {error ? (
        <p className="text-center text-red-500 px-4">{error}</p>
      ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar space-x-4 pb-2 px-4">
          {dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            // Affiche un état de chargement pour chaque carte tant que les données ne sont pas prêtes
            const workoutsForDay = loading ? null : dailyWorkouts[dateStr] || [];
            const isCurrentDay = isToday(date);

            return (
              <div
                key={dateStr}
                ref={isCurrentDay ? todayRef : null}
                className="snap-center flex-shrink-0 w-[85%] h-full"
              >
                {workoutsForDay ? (
                  <DayCard date={date} workouts={workoutsForDay} isReadOnly />
                ) : (
                  // Squelette de chargement pour chaque carte
                  <div className="w-full h-full rounded-2xl p-4 flex flex-col justify-between bg-light-card dark:bg-dark-card/50 animate-pulse">
                     <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                     <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded mt-1"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};