// src/components/common/DayCard.tsx
import React from 'react';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Edit3 } from 'lucide-react';
import { Workout } from '../../types';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';

interface DayCardProps {
  date: Date;
  workouts: Workout[];
  onPlanClick?: (date: Date) => void;
  onEditClick?: (workoutId: string) => void;
  onCardClick?: (workoutId: string) => void;
  isReadOnly?: boolean;
  isActive?: boolean;
}

const WorkoutTagBadge: React.FC<{ name: string; color?: string }> = ({ name, color }) => {
  return (
    <div
      className="px-3 py-1 rounded-full text-sm font-semibold text-white shadow-sm"
      style={{ backgroundColor: color || '#6B7280' }}
    >
      {name}
    </div>
  );
};

const generateWorkoutPreview = (workout: Workout): string => {
  const blocks = workout.planned_data?.blocs;
  if (!blocks || blocks.length === 0) {
    return workout.notes || 'Aucun détail';
  }

  const previewParts = blocks.slice(0, 3).map(block => {
    if (block.type === 'course') {
      return `${block.series}x${block.reps} ${block.distance}m`;
    }
    if (block.type === 'musculation') {
      return `${block.series}x${block.reps} ${block.exerciceNom}`;
    }
    return '';
  });

  let preview = previewParts.filter(p => p).join(', ');
  if (blocks.length > 3) {
    preview += '...';
  }
  return preview;
};

const hexToRgba = (hex: string, alpha: number): string => {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return `rgba(107, 114, 128, ${alpha})`; // Fallback to gray for invalid colors
  }
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  const i = parseInt(c.join(''), 16);
  const r = (i >> 16) & 255;
  const g = (i >> 8) & 255;
  const b = i & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const DayCard: React.FC<DayCardProps> = ({ date, workouts, onPlanClick, onEditClick, onCardClick, isReadOnly = false, isActive = false }) => {
  const { allTypes: workoutTypes } = useWorkoutTypes();

  const getDayLabel = () => {
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    if (isTomorrow(date)) return "Demain";
    return format(date, 'EEE d MMM', { locale: fr });
  };
  
  const findWorkoutType = (tagId: string) => {
    if (!workoutTypes || workoutTypes.length === 0) return undefined;
    return workoutTypes.find(wt => wt.id === tagId);
  };

  const hasWorkouts = workouts.length > 0;
  const mainWorkout = hasWorkouts ? workouts[0] : null;
  const mainWorkoutType = mainWorkout?.tag_seance ? findWorkoutType(mainWorkout.tag_seance) : undefined;

  const renderContent = () => {
    switch (workouts.length) {
      case 0:
        return (
          !isReadOnly && onPlanClick && (
            <button
              onClick={(e) => { e.stopPropagation(); onPlanClick(date); }}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg text-white bg-sprint-accent hover:opacity-90 transition-all duration-300 ease-in-out shadow-md transform hover:scale-105"
            >
              <Plus size={18} />
              Planifier
            </button>
          )
        );
      case 1: {
        const workout = workouts[0];
        return (
          <div className="text-left space-y-2 px-1">
            <p className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary line-clamp-3">
              {generateWorkoutPreview(workout)}
            </p>
          </div>
        );
      }
      case 2: {
        const workoutType1 = workouts[0].tag_seance ? findWorkoutType(workouts[0].tag_seance) : undefined;
        const workoutType2 = workouts[1].tag_seance ? findWorkoutType(workouts[1].tag_seance) : undefined;
        return (
          <div className="text-left space-y-3 px-1">
            <h4 className="font-bold text-lg text-sprint-light-text-primary dark:text-sprint-dark-text-primary">
              Bi-Quotidien
            </h4>
            <div className="space-y-2">
              <div className="border-l-2 pl-2" style={{ borderColor: workoutType1?.color || 'currentColor' }}>
                <p className="text-xs font-semibold truncate" style={{ color: workoutType1?.color || 'currentColor' }}>{workoutType1?.name}</p>
                <p className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary line-clamp-2">
                  {generateWorkoutPreview(workouts[0])}
                </p>
              </div>
              <div className="border-l-2 pl-2" style={{ borderColor: workoutType2?.color || 'currentColor' }}>
                <p className="text-xs font-semibold truncate" style={{ color: workoutType2?.color || 'currentColor' }}>{workoutType2?.name}</p>
                <p className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary line-clamp-2">
                  {generateWorkoutPreview(workouts[1])}
                </p>
              </div>
            </div>
          </div>
        );
      }
      default:
        return (
          <div className="text-center">
            <h4 className="font-bold text-lg text-sprint-light-text-primary dark:text-sprint-dark-text-primary">
              {workouts.length} Séances Planifiées
            </h4>
          </div>
        );
    }
  };

  const cardContent = (
    <>
      <header className="flex justify-between items-start">
        <div className="flex items-baseline gap-x-2 flex-wrap">
          <h3 className="font-bold text-xl text-sprint-light-text-primary dark:text-sprint-dark-text-primary">{getDayLabel()}</h3>
          {mainWorkoutType && <p className="font-semibold" style={{ color: mainWorkoutType.color }}>{mainWorkoutType.name}</p>}
        </div>
        {!isReadOnly && onEditClick && mainWorkout && (
          <div onClick={(e) => { e.stopPropagation(); onEditClick(mainWorkout.id); }} className="p-2 rounded-full transition-all bg-black/5 dark:bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/20 z-10 cursor-pointer">
            <Edit3 size={16} className="text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary" />
          </div>
        )}
      </header>
      <div className="flex-grow flex items-center justify-center">
        {renderContent()}
      </div>
    </>
  );

  const baseClasses = "w-full min-h-[250px] rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 group bg-sprint-light-surface dark:bg-sprint-dark-surface";
  
  const cardStyle: React.CSSProperties = {};
  if (isActive && mainWorkoutType?.color) {
    cardStyle.backgroundColor = hexToRgba(mainWorkoutType.color, 0.15);
  }

  if (mainWorkout && onCardClick) {
    return (
      <button 
        onClick={() => onCardClick(mainWorkout.id)} 
        className={`${baseClasses} text-left hover:scale-[1.02] active:scale-[0.98]`}
        style={cardStyle}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className={baseClasses} style={cardStyle}>
      {cardContent}
    </div>
  );
};