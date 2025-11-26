import React from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import useAuth from '../../hooks/useAuth';
import { Workout } from '../../types/workout';
import { Loader2 } from 'lucide-react';

const LastWorkoutCard: React.FC = () => {
  const { user } = useAuth();
  const { workouts, loading } = useWorkouts({
    selection: { type: 'athlete', id: user?.id || '' },
    mode: 'completed'
  });

  const lastWorkout = workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  if (loading) {
    return (
      <div className="mx-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (!lastWorkout) {
    return (
      <div className="mx-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Dernier entraînement réalisé</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Vous n'avez pas encore enregistré d'entraînement.</p>
      </div>
    );
  }

  const renderWorkoutContent = (workout: Workout) => {
    // Re-using the detailed rendering logic
    return (
      <div className="space-y-3 mt-4">
        {workout.workout_data?.blocks.map((block, index) => (
          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600/50">
            <p className="font-bold text-md text-gray-800 dark:text-gray-100">
              <span className="text-sprint-primary">{index + 1}.</span> {block.name}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300 mt-1 pl-4">
              {block.type === 'course' && (
                <>
                  <span><span className="font-semibold">{block.series}</span> séries</span>
                  <span><span className="font-semibold">{block.reps}</span> x <span className="font-semibold">{block.distance}</span>m</span>
                  {block.rest_inter_series && <span><span className="font-semibold">{block.rest_inter_series}</span> repos</span>}
                </>
              )}
              {block.type === 'muscu' && (
                <>
                  <span><span className="font-semibold">{block.series}</span> séries</span>
                  <span><span className="font-semibold">{block.reps}</span> reps</span>
                  {block.poids && <span>@ <span className="font-semibold">{block.poids}</span>kg</span>}
                  {block.rest && <span><span className="font-semibold">{block.rest}</span> repos</span>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md cursor-pointer">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Dernier entraînement réalisé</h3>
        <p className="text-sm text-gray-500">{new Date(lastWorkout.date).toLocaleDateString('fr-FR')}</p>
      </div>
      {renderWorkoutContent(lastWorkout)}
    </div>
  );
};

export default LastWorkoutCard;
