import React from 'react';
import { Dumbbell, Calendar, MapPin, Clock, Loader2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useWorkouts } from '../../hooks/useWorkouts';
import { formatTime, formatDistance } from '../../utils/formatters';

interface RecentWorkoutsProps {
  onNavigate: () => void;
}

export function RecentWorkouts({ onNavigate }: RecentWorkoutsProps) {
  const { workouts, loading } = useWorkouts();

  const recentWorkouts = workouts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Derniers entraînements</h2>
        <button
          onClick={onNavigate}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Voir tout <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      {recentWorkouts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <Dumbbell className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Aucun entraînement enregistré.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentWorkouts.map((workout) => (
            <div key={workout.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between mb-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(workout.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workout.runs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-blue-500 mb-2 flex items-center"><MapPin className="h-4 w-4 mr-1" />Courses ({workout.runs.length})</h4>
                    {workout.runs.slice(0, 2).map(run => (
                      <p key={run.id} className="text-sm text-gray-700 dark:text-gray-300">{formatDistance(run.distance)} en {formatTime(run.time)}</p>
                    ))}
                    {workout.runs.length > 2 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+{workout.runs.length - 2} autre(s)</p>}
                  </div>
                )}
                {workout.exercises.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-purple-500 mb-2 flex items-center"><Dumbbell className="h-4 w-4 mr-1" />Exercices ({workout.exercises.length})</h4>
                    {workout.exercises.slice(0, 2).map(ex => (
                      <p key={ex.id} className="text-sm text-gray-700 dark:text-gray-300">{ex.name}: {ex.sets}x{ex.reps} @{ex.weight}kg</p>
                    ))}
                    {workout.exercises.length > 2 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+{workout.exercises.length - 2} autre(s)</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}