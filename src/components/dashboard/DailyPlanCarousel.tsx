import React, { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Workout } from '../../types';
import { DayCard } from '../planning/DayCard';
import { groupWorkoutsByDay } from '../../utils/groupWorkoutsByDay';

interface DailyPlanCarouselProps {
  workouts: Workout[];
  onPlanClick: (date: Date) => void;
  onEditClick: (workoutId: string) => void;
}

export const DailyPlanCarousel: React.FC<DailyPlanCarouselProps> = ({ workouts, onPlanClick, onEditClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const dailyWorkouts = groupWorkoutsByDay(workouts);

  const handleDateChange = (direction: 'prev' | 'next') => {
    setCurrentDate(current => (direction === 'prev' ? subDays(current, 1) : addDays(current, 1)));
  };

  const todayStr = format(currentDate, 'yyyy-MM-dd');
  const todaysWorkouts = dailyWorkouts[todayStr] || [];

  return (
    <div className="bg-light-card dark:bg-dark-card shadow-card-light dark:shadow-card-dark rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => handleDateChange('prev')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-light-title dark:text-dark-title">
          {format(currentDate, 'EEEE d MMMM', { locale: fr })}
        </h2>
        <button onClick={() => handleDateChange('next')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ChevronRight size={20} />
        </button>
      </div>
      <DayCard
        date={currentDate}
        workouts={todaysWorkouts}
        onPlanClick={() => onPlanClick(currentDate)}
        onEditClick={onEditClick}
      />
    </div>
  );
};