// src/components/common/DayCard.tsx
import React from 'react';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Edit3, ChevronDown } from 'lucide-react';
import { Workout, WorkoutBlock, CourseBlock, MuscuBlock } from '../../types';

interface DayCardProps {
  date: Date;
  workouts: Workout[];
  onPlanClick?: (date: Date) => void;
  onEditClick?: (workoutId: string) => void;
  onCardClick?: (workoutId: string) => void; // Pour ouvrir les détails
  isReadOnly?: boolean;
}

// Nouveau résumé détaillé
const WorkoutSummary: React.FC<{ blocs: WorkoutBlock[] }> = ({ blocs }) => {
  const MAX_BLOCS_TO_SHOW = 3;
  const visibleBlocs = blocs.slice(0, MAX_BLOCS_TO_SHOW);

  return (
    <div className="space-y-2 text-sm text-left">
      {visibleBlocs.map((bloc, index) => {
        let summary = '';
        if (bloc.type === 'course') {
          const courseBloc = bloc as CourseBlock;
          summary = `${courseBloc.series}x ${courseBloc.distance}m`;
        } else if (bloc.type === 'musculation') {
          const muscuBloc = bloc as MuscuBlock;
          summary = `${muscuBloc.series}x${muscuBloc.reps}${muscuBloc.poids ? ` @ ${muscuBloc.poids}kg` : ''} - ${muscuBloc.exerciceNom}`;
        }
        return <p key={index} className="truncate">{summary}</p>;
      })}
      {blocs.length > MAX_BLOCS_TO_SHOW && (
        <div className="flex items-center justify-center text-xs text-light-label dark:text-dark-label pt-2">
          <ChevronDown size={16} className="mr-1" />
          <span>Voir plus</span>
        </div>
      )}
    </div>
  );
};

export const DayCard: React.FC<DayCardProps> = ({ date, workouts, onPlanClick, onEditClick, onCardClick, isReadOnly = false }) => {
  const getDayLabel = () => {
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    if (isTomorrow(date)) return "Demain";
    return format(date, 'EEE d MMM', { locale: fr });
  };

  const hasWorkouts = workouts.length > 0;
  const mainWorkout = hasWorkouts ? workouts[0] : null;

  const cardContent = (
    <>
      <header className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-xl text-light-title dark:text-dark-title">{getDayLabel()}</h3>
          <p className="text-sm text-light-label dark:text-dark-label">{format(date, 'd MMMM', { locale: fr })}</p>
        </div>
        {!isReadOnly && onEditClick && mainWorkout && (
          <button onClick={(e) => { e.stopPropagation(); onEditClick(mainWorkout.id); }} className="p-2 rounded-full transition-all bg-black/5 dark:bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/20 z-10">
            <Edit3 size={16} className="text-gray-700 dark:text-gray-300" />
          </button>
        )}
      </header>

      <div className="flex-grow flex items-center justify-center">
        {mainWorkout?.planned_data?.blocs ? (
          <WorkoutSummary blocs={mainWorkout.planned_data.blocs} />
        ) : (
          !isReadOnly && onPlanClick && (
            <button
              onClick={(e) => { e.stopPropagation(); onPlanClick(date); }}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg text-white bg-sprintflow-blue hover:opacity-90 transition-all duration-300 ease-in-out shadow-md transform hover:scale-105"
            >
              <Plus size={18} />
              Planifier
            </button>
          )
        )}
      </div>

      {mainWorkout?.tag_seance && (
        <footer className="text-left">
          <p className="font-bold text-base truncate text-light-title dark:text-dark-title">
            {mainWorkout.tag_seance}
          </p>
        </footer>
      )}
    </>
  );

  const baseClasses = "w-full min-h-[250px] rounded-2xl p-4 flex flex-col justify-between bg-light-glass dark:bg-dark-glass shadow-glass backdrop-blur-lg border border-white/10 transition-all duration-300 group";

  if (isReadOnly && mainWorkout && onCardClick) {
    return (
      <button onClick={() => onCardClick(mainWorkout.id)} className={`${baseClasses} text-left`}>
        {cardContent}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {cardContent}
    </div>
  );
};