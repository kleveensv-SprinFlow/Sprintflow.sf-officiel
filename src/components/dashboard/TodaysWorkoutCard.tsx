import React, { useState } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import useAuth from '../../hooks/useAuth';
import { Workout } from '../../types/workout';
import { Loader2, ChevronDown } from 'lucide-react';
import { WorkoutBlock } from '../../types/workout';

const TodaysWorkoutCard: React.FC = () => {
  const { user } = useAuth();
  const { workouts, loading } = useWorkouts({
    selection: { type: 'athlete', id: user?.id || '' },
    mode: 'planned'
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysWorkout = workouts.find(w => {
    const workoutDate = new Date(w.date);
    workoutDate.setHours(0, 0, 0, 0);
    return workoutDate.getTime() === today.getTime();
  });

  if (loading) {
    return (
      <div className="mx-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  // FIX: Accessing .blocks (which might be 'blocs' or a different structure)
  // Assuming Workout structure based on previous interactions, it's usually planned_data as WorkoutBlock[] or { blocs: ... }
  // The MOCK in AthletePlanning used array for planned_data.
  // The CoachDashboard uses 'blocs'.
  // Let's safe check.

  const getBlocks = (w: Workout): WorkoutBlock[] => {
      if (Array.isArray(w.planned_data)) return w.planned_data as any;
      if (w.planned_data && 'blocs' in w.planned_data) return (w.planned_data as any).blocs;
      return [];
  };

  if (!todaysWorkout) {
    return (
      <div className="mx-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Séance du jour</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Aucun entraînement prévu aujourd'hui. Profitez de votre repos !</p>
      </div>
    );
  }

  const blocks = getBlocks(todaysWorkout);

  const renderWorkoutContent = (workout: Workout) => {
    const blocksToShow = isExpanded ? blocks : blocks.slice(0, 3);
    return (
      <div className="space-y-3 mt-4">
        {blocksToShow?.map((block: any, index: number) => (
          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600/50">
            <p className="font-bold text-md text-gray-800 dark:text-gray-100">
              <span className="text-sprint-primary">{index + 1}.</span> {block.name || `Bloc ${index+1}`}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300 mt-1 pl-4">
              {block.type === 'course' && (
                <>
                  <span><span className="font-semibold">{block.series}</span> séries</span>
                  <span><span className="font-semibold">{block.reps}</span> x <span className="font-semibold">{block.distance}</span>m</span>
                </>
              )}
              {block.type === 'muscu' && (
                <>
                  <span><span className="font-semibold">{block.series}</span> séries</span>
                  <span><span className="font-semibold">{block.reps}</span> reps</span>
                  {block.poids && <span>@ <span className="font-semibold">{block.poids}</span>kg</span>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const blockCount = blocks.length || 0;
  const canExpand = blockCount > 3;

  return (
    <div className="mx-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md cursor-pointer">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Séance du jour</h3>
      
      {renderWorkoutContent(todaysWorkout)}

      {canExpand && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-full mt-4 flex items-center justify-center text-sm font-semibold text-sprint-primary"
        >
          {isExpanded ? 'Voir moins' : 'Voir plus'}
          <ChevronDown className={`ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={16} />
        </button>
      )}
    </div>
  );
};

export default TodaysWorkoutCard;
