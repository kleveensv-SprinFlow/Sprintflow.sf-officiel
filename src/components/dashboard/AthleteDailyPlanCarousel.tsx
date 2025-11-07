import React, { useState, useEffect } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Workout } from '../../types';
import { DayCard } from '../planning/DayCard';
import { groupWorkoutsByDay } from '../../utils/groupWorkoutsByDay';

export const AthleteDailyPlanCarousel: React.FC = () => {
  const { workouts, loading, error } = useWorkouts();
  const [dailyWorkouts, setDailyWorkouts] = useState<Record<string, Workout[]>>({});
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const plannedWorkouts = workouts.filter(w => w.status === 'planned');
    setDailyWorkouts(groupWorkoutsByDay(plannedWorkouts));
  }, [workouts]);

  const handleDateChange = (days: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };

  const todayStr = currentDate.toISOString().split('T')[0];
  const todaysWorkouts = dailyWorkouts[todayStr] || [];

  return (
    <div className="bg-light-card dark:bg-dark-card shadow-card-light dark:shadow-card-dark rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-light-title dark:text-dark-title">Aujourd'hui</h2>
        <div className="flex items-center space-x-2">
          <button onClick={() => handleDateChange(-1)}>&lt;</button>
          <span className="text-sm font-semibold">{currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
          <button onClick={() => handleDateChange(1)}>&gt;</button>
        </div>
      </div>
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <DayCard date={currentDate} workouts={todaysWorkouts} isReadOnly />
      )}
    </div>
  );
};