// src/components/common/DayCard.tsx
import React from 'react';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Edit3, CheckCircle2, Clock, Dumbbell } from 'lucide-react';
import { Workout } from '../../types';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';
import { motion } from 'framer-motion';

interface DayCardProps {
  date: Date;
  workouts: Workout[];
  onPlanClick?: (date: Date) => void;
  onEditClick?: (workoutId: string) => void;
  onCardClick?: (workoutId: string) => void;
  isReadOnly?: boolean;
  isActive?: boolean;
}

const generateWorkoutPreview = (workout: Workout): string => {
  const blocks = workout.planned_data?.blocs || workout.workout_data?.blocs;
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
  const isCompleted = mainWorkout?.status === 'completed';

  const renderContent = () => {
    switch (workouts.length) {
      case 0:
        return (
          !isReadOnly && onPlanClick && (
            <div className="flex items-center justify-center w-full h-full">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); onPlanClick(date); }}
                className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-sprint-light-surface dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-sprint-accent dark:hover:border-sprint-accent transition-colors duration-300"
              >
                <Plus size={32} className="text-gray-400 group-hover:text-sprint-accent transition-colors duration-300" />
              </motion.button>
              <div className="absolute bottom-6 text-sm font-medium text-gray-400 group-hover:text-sprint-accent transition-colors duration-300">
                Planifier
              </div>
            </div>
          )
        );
      case 1: {
        const workout = workouts[0];
        return (
          <div className="flex flex-col h-full justify-between py-2">
             <div className="space-y-4">
                <div className="flex items-center gap-2">
                   {workout.type === 'guidé' ? <Clock size={18} className="text-gray-400"/> : <Dumbbell size={18} className="text-gray-400"/>}
                   <h4 className={`text-xl font-bold line-clamp-2 leading-tight ${isCompleted ? 'text-white' : 'text-sprint-light-text-primary dark:text-sprint-dark-text-primary'}`}>
                     {workoutTypeLabel(workout)}
                   </h4>
                </div>
                
                <p className={`text-lg font-medium line-clamp-3 ${isCompleted ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                  {generateWorkoutPreview(workout)}
                </p>
             </div>

             {isCompleted && (
                <div className="flex items-center gap-2 mt-auto pt-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                        <CheckCircle2 size={20} className="text-white" />
                    </div>
                    <span className="text-white font-bold tracking-wide text-sm uppercase">Séance Terminée</span>
                </div>
             )}
          </div>
        );
      }
      case 2: {
        const workoutType1 = workouts[0].tag_seance ? findWorkoutType(workouts[0].tag_seance) : undefined;
        const workoutType2 = workouts[1].tag_seance ? findWorkoutType(workouts[1].tag_seance) : undefined;
        return (
          <div className="flex flex-col h-full gap-4 py-2">
            <h4 className="font-extrabold text-xl tracking-tight text-sprint-light-text-primary dark:text-sprint-dark-text-primary">
              Bi-Quotidien
            </h4>
            <div className="flex flex-col gap-3 overflow-hidden">
              <div className="relative pl-3 border-l-4 rounded-sm" style={{ borderColor: workoutType1?.color || 'currentColor' }}>
                 <p className="text-xs font-bold uppercase tracking-wider mb-0.5 opacity-80" style={{ color: workoutType1?.color || 'currentColor' }}>{workoutType1?.name || 'Séance 1'}</p>
                 <p className="text-sm font-medium truncate text-sprint-light-text-primary dark:text-sprint-dark-text-primary">
                  {generateWorkoutPreview(workouts[0])}
                 </p>
              </div>
              <div className="relative pl-3 border-l-4 rounded-sm" style={{ borderColor: workoutType2?.color || 'currentColor' }}>
                 <p className="text-xs font-bold uppercase tracking-wider mb-0.5 opacity-80" style={{ color: workoutType2?.color || 'currentColor' }}>{workoutType2?.name || 'Séance 2'}</p>
                 <p className="text-sm font-medium truncate text-sprint-light-text-primary dark:text-sprint-dark-text-primary">
                  {generateWorkoutPreview(workouts[1])}
                 </p>
              </div>
            </div>
          </div>
        );
      }
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <h4 className="font-extrabold text-2xl text-center leading-tight text-sprint-light-text-primary dark:text-sprint-dark-text-primary">
              {workouts.length}<br/>
              <span className="text-lg font-medium text-gray-500">Séances</span>
            </h4>
          </div>
        );
    }
  };

  const workoutTypeLabel = (workout: Workout) => {
      if (workout.tag_seance) {
          const type = findWorkoutType(workout.tag_seance);
          return type?.name || 'Entraînement';
      }
      return 'Entraînement';
  }

  // Styles dynamiques
  const baseClasses = "relative w-full min-h-[280px] rounded-3xl p-6 flex flex-col justify-between overflow-hidden transition-all duration-300";
  
  let backgroundStyle: React.CSSProperties = {};
  let textHeaderColor = "text-sprint-light-text-primary dark:text-sprint-dark-text-primary";

  if (isCompleted && mainWorkoutType?.color) {
      // Style "Addictive/Gratifiant" pour le status Completed
      backgroundStyle = {
          background: `linear-gradient(135deg, ${mainWorkoutType.color} 0%, ${hexToRgba(mainWorkoutType.color, 0.8)} 100%)`,
          boxShadow: `0 10px 30px -10px ${mainWorkoutType.color}`,
      };
      textHeaderColor = "text-white";
  } else if (isActive) {
       // Active "Planned" state
       backgroundStyle = { backgroundColor: 'var(--sprint-light-surface)', borderColor: mainWorkoutType?.color }; 
       // Note: We handle dark mode via classes, but inline styles override. 
       // Better to use classes for basic backgrounds and style for dynamic colors.
  }

  const cardContent = (
    <>
      {/* Header Date */}
      <header className="flex justify-between items-start mb-4 z-10 relative">
        <div className="flex flex-col">
          <h3 className={`text-3xl font-extrabold tracking-tight capitalize ${textHeaderColor}`}>
            {format(date, 'EEE', { locale: fr }).replace('.', '')}
          </h3>
           <span className={`text-lg font-semibold opacity-60 ${textHeaderColor}`}>
            {format(date, 'd MMM', { locale: fr })}
           </span>
        </div>
        
        {!isReadOnly && onEditClick && mainWorkout && !isCompleted && (
          <motion.button 
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             onClick={(e) => { e.stopPropagation(); onEditClick(mainWorkout.id); }} 
             className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          >
            <Edit3 size={18} className="text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary" />
          </motion.button>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-grow z-10 relative">
        {renderContent()}
      </div>
      
      {/* Decorative Background Elements for Minimalist feel */}
      {!isCompleted && hasWorkouts && mainWorkoutType && (
         <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 pointer-events-none"
            style={{ backgroundColor: mainWorkoutType.color }} 
         />
      )}
    </>
  );

  // Wrapper logic
  if (mainWorkout && onCardClick) {
    return (
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onCardClick(mainWorkout.id)} 
        className={`${baseClasses} text-left shadow-neumorphic-flat dark:shadow-none bg-sprint-light-surface dark:bg-sprint-dark-surface`}
        style={isCompleted ? backgroundStyle : {}}
      >
        {cardContent}
      </motion.button>
    );
  }

  return (
    <div className={`${baseClasses} shadow-neumorphic-flat dark:shadow-none bg-sprint-light-surface dark:bg-sprint-dark-surface`} style={isCompleted ? backgroundStyle : {}}>
      {cardContent}
    </div>
  );
};
