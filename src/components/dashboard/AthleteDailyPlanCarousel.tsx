// src/components/dashboard/AthleteDailyPlanCarousel.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [activeCardIndex, setActiveCardIndex] = useState(-1);
  
  const todayRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
        setActiveCardIndex(index);
      }
    });
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 0.7, // La carte doit être visible à 70% pour être considérée comme active
    });

    const currentObserver = observer.current;

    cardRefs.current.forEach(card => {
      if (card) {
        currentObserver.observe(card);
      }
    });

    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [handleIntersection, dateRange]);


  useEffect(() => {
    const today = new Date();
    const range = Array.from({ length: 7 }, (_, i) => subDays(today, 3 - i));
    setDateRange(range);
  }, []);

  useEffect(() => {
    if (workouts) {
      // Filter for both planned and completed workouts
      const relevantWorkouts = workouts.filter(w => w.status === 'planned' || w.status === 'completed');
      setDailyWorkouts(groupWorkoutsByDay(relevantWorkouts));
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
      <div className="space-y-4 px-4">
        <h2 className="text-xl font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">Mon Planning</h2>
        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar space-x-4 pb-2 -mx-4 px-4">
            {dateRange.map((date, index) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const workoutsForDay = loading ? null : dailyWorkouts[dateStr] || [];
              const isCurrentDay = isToday(date);
              
              // Si une séance existe, on passe la fonction de clic
              const onCardClick = workoutsForDay && workoutsForDay.length > 0 ? handleCardClick : undefined;

              return (
                <div
                  key={dateStr}
                  ref={el => {
                    cardRefs.current[index] = el;
                    if (isCurrentDay) {
                      (todayRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                    }
                  }}
                  data-index={index}
                  className="snap-center flex-shrink-0 w-[85%] h-full"
                >
                  {workoutsForDay ? (
                    <DayCard 
                      date={date} 
                      workouts={workoutsForDay} 
                      isReadOnly 
                      onCardClick={onCardClick} // <-- Ajout de la prop
                      isActive={activeCardIndex === index}
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl p-4 flex flex-col justify-between bg-sprint-light-surface dark:bg-sprint-dark-surface/50 animate-pulse">
                       <div className="h-6 w-3/4 bg-sprint-light-text-secondary/30 dark:bg-sprint-dark-text-secondary/30 rounded"></div>
                       <div className="h-4 w-1/2 bg-sprint-light-text-secondary/30 dark:bg-sprint-dark-text-secondary/30 rounded mt-1"></div>
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
