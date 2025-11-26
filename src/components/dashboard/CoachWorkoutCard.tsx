import React from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Workout } from '../../types/workout';
import { Loader2, PlusCircle, Edit } from 'lucide-react';

interface CoachWorkoutCardProps {
  selection: {
    type: 'athlete' | 'group';
    id: string;
  } | null;
  onPlan: (date: Date) => void;
  onEdit: (workoutId: string) => void;
  onView: (workoutId: string) => void;
}

const CoachWorkoutCard: React.FC<CoachWorkoutCardProps> = ({ selection, onPlan, onEdit, onView }) => {
  const { workouts, loading } = useWorkouts(selection || undefined);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysWorkout = workouts.find(w => {
    const workoutDate = new Date(w.date);
    workoutDate.setHours(0, 0, 0, 0);
    return workoutDate.getTime() === today.getTime();
  });

  const renderWorkoutContent = (workout: Workout) => (
     <div className="space-y-3 mt-4">
        {workout.planned_data?.blocks.map((block, index) => (
          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="font-bold text-md text-gray-800 dark:text-gray-100">
              <span className="text-sprint-primary">{index + 1}.</span> {block.name}
            </p>
          </div>
        ))}
      </div>
  );

  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Planning du jour</h3>
      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
      ) : todaysWorkout ? (
        <div onClick={() => onView(todaysWorkout.id)} className="cursor-pointer">
            {renderWorkoutContent(todaysWorkout)}
            <button onClick={(e) => { e.stopPropagation(); onEdit(todaysWorkout.id); }} className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-sprint-primary rounded-lg py-2">
                <Edit size={16} /> Modifier
            </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-4">Aucune séance planifiée pour aujourd'hui.</p>
          <button onClick={() => onPlan(today)} className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-accent rounded-lg py-2 px-4 mx-auto">
            <PlusCircle size={16} /> Planifier une séance
          </button>
        </div>
      )}
    </div>
  );
};

export default CoachWorkoutCard;
