// src/components/dashboard/AthleteDailyPlanCarousel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Workout } from '../../types';
import { DayCard } from '../common/DayCard';
import { WorkoutDetailsModal } from '../workouts/WorkoutDetailsModal'; // Import de la modale
import { groupWorkoutsByDay } from '../../utils/groupWorkoutsByDay';
import { subDays, format, isToday } from 'date-fns';

export const AthleteDailyPlanCarousel: React.FC = () => {
  const { workouts, loading, error } = useWorkouts();
  const [dailyWorkouts, setDailyWorkouts] = useState<Record<string, Workout[]>>({});
  const [dateRange, setDateRange] = useState<Date[]>([]);
  
  // État pour gérer la séance sélectionnée et l'affichage de la modale
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  
  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date();
    const range = Array.from({ length: 7 }, (_, i) => subDays(today, 3 - i));
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
      }, 50);
    }
  }, [loading]);

  // Fonction pour ouvrir la modale avec la bonne séance
  const handleCardClick = (workoutId: string) => {
    const workoutToShow = workouts?.find(w => w.id === workoutId);
    if (workoutToShow) {
      setSelectedWorkout(workoutToShow);
    }
  };

  // Fonction pour fermer la modale
  const handleCloseModal = () => {
    setSelectedWorkout(null);
  };

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary px-4">Mon Planning</h2>
        {error ? (
          <p className="text-center text-red-500 px-4">{error}</p>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar space-x-4 pb-2 px-4">
            {dateRange.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const workoutsForDay = loading ? null : dailyWorkouts[dateStr] || [];
              const isCurrentDay = isToday(date);
              
              // Si une séance existe, on passe la fonction de clic
              const onCardClick = workoutsForDay && workoutsForDay.length > 0 ? handleCardClick : undefined;

              return (
                <div
                  key={dateStr}
                  ref={isCurrentDay ? todayRef : null}
                  className="snap-center flex-shrink-0 w-[85%] h-full"
                >
                  {workoutsForDay ? (
                    <DayCard 
                      date={date} 
                      workouts={workoutsForDay} 
                      isReadOnly 
                      onCardClick={onCardClick} // <-- Ajout de la prop
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl p-4 flex flex-col justify-between bg-sprint-light-surface dark:bg-sprint-dark-surface/50 animate-pulse">
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

      {/* Rendu de la modale */}
      <WorkoutDetailsModal
        isOpen={!!selectedWorkout}
        onClose={handleCloseModal}
        workout={selectedWorkout}
      />
    </>
  );
};
