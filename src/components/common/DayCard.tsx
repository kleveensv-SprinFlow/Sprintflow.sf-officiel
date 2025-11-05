import React from 'react';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Edit3 } from 'lucide-react';
import { Workout } from '../../types';

interface DayCardProps {
  date: Date;
  workout: Workout | null;
  isActive: boolean;
  onPlanClick?: (date: Date) => void;
  onEditClick?: (workoutId: string) => void;
  isReadOnly?: boolean;
}

const WorkoutSummary: React.FC<{ workout: Workout }> = ({ workout }) => {
  if (workout.type === 'manuscrit' && workout.notes) {
    return (
      <div className="text-sm text-left overflow-hidden">
        <p className="whitespace-pre-wrap line-clamp-4">{workout.notes}</p>
      </div>
    );
  }

  const blocs = workout.planned_data?.blocs || [];
  const courseBlocs = blocs.filter(b => b.type === 'course').length;
  const muscuBlocs = blocs.filter(b => b.type === 'muscu').length;

  return (
    <div className="space-y-2 text-sm text-left">
      {courseBlocs > 0 && <p>{courseBlocs} bloc(s) de course</p>}
      {muscuBlocs > 0 && <p>{muscuBlocs} bloc(s) de musculation</p>}
    </div>
  );
};

export const DayCard: React.FC<DayCardProps> = ({ date, workout, isActive, onPlanClick, onEditClick, isReadOnly = false }) => {
  const getDayLabel = () => {
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    if (isTomorrow(date)) return "Demain";
    return format(date, 'EEE d MMM', { locale: fr });
  };

  return (
    <div className={`w-full h-full rounded-2xl p-4 flex flex-col justify-between card-glass shadow-lg transition-all duration-300 group ${
      isActive ? 'border-primary-500/50' : ''
    }`}>
      <header className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-xl text-gray-800 dark:text-white">{getDayLabel()}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{format(date, 'd MMMM', { locale: fr })}</p>
        </div>
        {workout && !isReadOnly && onEditClick && (
          <button onClick={() => onEditClick(workout.id)} className="p-2 rounded-full transition-all bg-black/5 dark:bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/20">
            <Edit3 size={16} className="text-gray-700 dark:text-gray-300" />
          </button>
        )}
      </header>

      <div className="flex-grow flex items-center justify-center">
        {workout ? (
          <div className="text-gray-800 dark:text-gray-200">
            <WorkoutSummary workout={workout} />
          </div>
        ) : (
          !isReadOnly && onPlanClick && (
            <button
              onClick={() => onPlanClick(date)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-all duration-300 ease-in-out shadow-md transform hover:scale-105"
            >
              <Plus size={18} />
              Planifier
            </button>
          )
        )}
      </div>

      {workout?.title && (
        <footer className="text-left">
          <p className="font-bold text-base truncate text-gray-800 dark:text-white">
            {workout.title}
          </p>
        </footer>
      )}
    </div>
  );
};
