import React from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Workout } from '../../types';

interface RecentWorkoutsProps {
  onNavigate: () => void;
}

export const RecentWorkouts: React.FC<RecentWorkoutsProps> = ({ onNavigate }) => {
  const { workouts, loading } = useWorkouts();

  const recentWorkouts = workouts
    .filter(w => w.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="bg-light-card dark:bg-dark-card shadow-card-light dark:shadow-card-dark rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-light-title dark:text-dark-title">Séances Récentes</h2>
        <button onClick={onNavigate} className="text-sm text-accent font-semibold">Voir tout</button>
      </div>
      {loading && <p>Chargement...</p>}
      <div className="space-y-2">
        {recentWorkouts.map((workout: Workout) => (
          <div key={workout.id} className="p-2 rounded-md bg-light-background dark:bg-dark-background">
            <p className="font-semibold">{workout.tag_seance}</p>
            <p className="text-sm text-light-label dark:text-dark-label">{new Date(workout.date).toLocaleDateString('fr-FR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};