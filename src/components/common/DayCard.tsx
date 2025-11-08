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
}

// Le nouveau composant pour afficher le badge du tag de séance
const WorkoutTagBadge: React.FC<{ name: string; color?: string }> = ({ name, color }) => {
  return (
    <div
      className="px-3 py-1 rounded-full text-sm font-semibold text-white shadow-sm"
      style={{ backgroundColor: color || '#6B7280' }} // Couleur grise par défaut si non spécifiée
    >
      {name}
    </div>
  );
};

export const DayCard: React.FC<DayCardProps> = ({ date, workouts, onPlanClick, onEditClick, onCardClick, isReadOnly = false }) => {
  const { allTypes: workoutTypes, loading: typesLoading } = useWorkoutTypes();

  const getDayLabel = () => {
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    if (isTomorrow(date)) return "Demain";
    return format(date, 'EEE d MMM', { locale: fr });
  };
  
  // Fonction pour trouver les détails d'un type de séance (nom, couleur) par son ID
  const findWorkoutType = (tagId: string) => {
    if (!workoutTypes || workoutTypes.length === 0) return undefined;
    return workoutTypes.find(wt => wt.id === tagId);
  };

  const hasWorkouts = workouts.length > 0;
  // La première séance détermine l'action des boutons "Modifier" et "Voir"
  const mainWorkout = hasWorkouts ? workouts[0] : null;

  // Nouvelle logique d'affichage du contenu principal de la carte
  const renderContent = () => {
    switch (workouts.length) {
      case 0:
        return (
          !isReadOnly && onPlanClick && (
            <button
              onClick={(e) => { e.stopPropagation(); onPlanClick(date); }}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg text-white bg-sprintflow-blue hover:opacity-90 transition-all duration-300 ease-in-out shadow-md transform hover:scale-105"
            >
              <Plus size={18} />
              Planifier
            </button>
          )
        );
      case 1: {
        const workout = workouts[0];
        const workoutType = workout.tag_seance ? findWorkoutType(workout.tag_seance) : undefined;
        return (
          <div className="text-center space-y-3">
            <h4 className="font-bold text-lg text-light-title dark:text-dark-title truncate px-2">
              {workoutType?.name || 'Entraînement'}
            </h4>
            {workoutType && (
              <div className="flex justify-center">
                <WorkoutTagBadge name={workoutType.name} color={workoutType.color} />
              </div>
            )}
          </div>
        );
      }
      case 2: {
        const workoutType1 = workouts[0].tag_seance ? findWorkoutType(workouts[0].tag_seance) : undefined;
        const workoutType2 = workouts[1].tag_seance ? findWorkoutType(workouts[1].tag_seance) : undefined;
        return (
          <div className="text-center space-y-3">
            <h4 className="font-bold text-lg text-light-title dark:text-dark-title">
              Entraînement Bi-Quotidien
            </h4>
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {workoutType1 && <WorkoutTagBadge name={workoutType1.name} color={workoutType1.color} />}
              {workoutType2 && <WorkoutTagBadge name={workoutType2.name} color={workoutType2.color} />}
            </div>
          </div>
        );
      }
      default:
        return (
          <div className="text-center">
            <h4 className="font-bold text-lg text-light-title dark:text-dark-title">
              {workouts.length} Séances Planifiées
            </h4>
          </div>
        );
    }
  };

  const cardContent = (
    <>
      <header className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-xl text-light-title dark:text-dark-title">{getDayLabel()}</h3>
          <p className="text-sm text-light-label dark:text-dark-label">{format(date, 'd MMMM', { locale: fr })}</p>
        </div>
        {!isReadOnly && onEditClick && mainWorkout && (
          <div onClick={(e) => { e.stopPropagation(); onEditClick(mainWorkout.id); }} className="p-2 rounded-full transition-all bg-black/5 dark:bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/20 z-10 cursor-pointer">
            <Edit3 size={16} className="text-gray-700 dark:text-gray-300" />
          </div>
        )}
      </header>

      <div className="flex-grow flex items-center justify-center">
        {renderContent()}
      </div>
    </>
  );

  const baseClasses = "w-full min-h-[250px] rounded-2xl p-4 flex flex-col justify-between bg-light-glass dark:bg-dark-glass shadow-glass backdrop-blur-lg border border-white/10 transition-all duration-300 group";

  if (mainWorkout && onCardClick) {
    return (
      <button 
        onClick={() => onCardClick(mainWorkout.id)} 
        className={`${baseClasses} text-left hover:scale-[1.02] active:scale-[0.98]`}
      >
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