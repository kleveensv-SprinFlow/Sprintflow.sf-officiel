import React from 'react';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Edit3 } from 'lucide-react';
import { Workout } from '../../types';

interface DayCardProps {
  date: Date;
  workout: Workout | null;
  isActive: boolean;
  onPlanClick: (date: Date) => void;
  onEditClick: (workoutId: string) => void;
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

export const DayCard: React.FC<DayCardProps> = ({ date, workout, isActive, onPlanClick, onEditClick }) => {
  const getDayLabel = () => {
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    if (isTomorrow(date)) return "Demain";
    return format(date, 'EEE d MMM', { locale: fr });
  };

  return (
    <div className={`w-full h-full rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all duration-300
      ${isActive
        ? 'bg-primary-500 text-white shadow-primary-500/40'
        : 'bg-white dark:bg-gray-800'}`
    }>
      <header className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{getDayLabel()}</h3>
          <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>{format(date, 'd MMMM', { locale: fr })}</p>
        </div>
        {workout && (
          <button onClick={() => onEditClick(workout.id)} className={`p-2 rounded-full transition-colors ${isActive ? 'hover:bg-white/20' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <Edit3 size={16} />
          </button>
        )}
      </header>

      <div className="flex-grow flex items-center justify-center">
        {workout ? (
          <WorkoutSummary workout={workout} />
        ) : (
          <button
            onClick={() => onPlanClick(date)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${isActive
                ? 'bg-white/20 hover:bg-white/30'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`
            }>
            <Plus size={18} />
            Planifier
          </button>
        )}
      </div>

      {workout?.title && (
        <footer className="text-left">
            <p className={`font-semibold text-sm truncate ${isActive ? '' : 'text-gray-700 dark:text-gray-300'}`}>
                {workout.title}
            </p>
        </footer>
      )}
    </div>
  );
};
