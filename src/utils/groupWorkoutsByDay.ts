// src/utils/groupWorkoutsByDay.ts
import { Workout } from '../types';

export const groupWorkoutsByDay = (workouts: Workout[]): Record<string, Workout[]> => {
  if (!workouts) {
    return {};
  }

  return workouts.reduce((acc, workout) => {
    // Assure que la date est bien une chaîne de caractères et prend uniquement la partie date (YYYY-MM-DD)
    const dateStr = typeof workout.date === 'string' ? workout.date.split('T')[0] : new Date(workout.date).toISOString().split('T')[0];
    
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(workout);
    return acc;
  }, {} as Record<string, Workout[]>);
};