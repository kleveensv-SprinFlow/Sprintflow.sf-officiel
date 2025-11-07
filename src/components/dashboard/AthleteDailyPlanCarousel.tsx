import React, { useState, useEffect } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Workout } from '../../types';
import { DayCard } from '../common/DayCard'; // CHEMIN D'IMPORTATION ENFIN CORRIGÉ
import { groupWorkoutsByDay } from '../../utils/groupWorkoutsByDay';

export const AthleteDailyPlanCarousel: React.FC = () => {
  const { workouts, loading, error } = useWorkouts();
  const [dailyWorkouts, setDailyWorkouts] = useState<Record<string, Workout[]>>({});
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (workouts) {
        const plannedWorkouts = workouts.filter(w => w.status === 'planned');
        setDailyWorkouts(groupWorkoutsByDay(plannedWorkouts));
    }
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
        <div className="flex items-center space-x-2 text-light-text dark:text-dark-text">
          <button onClick={() => handleDateChange(-1)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&lt;</button>
          <span className="text-sm font-semibold">{currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
          <button onClick={() => handleDateChange(1)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&gt;</button>
        </div>
      </div>
      {loading ? (
        <p className="text-center text-light-label dark:text-dark-label">Chargement du planning...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <DayCard date={currentDate} workouts={todaysWorkouts} isReadOnly />
      )}
    </div>
  );
};