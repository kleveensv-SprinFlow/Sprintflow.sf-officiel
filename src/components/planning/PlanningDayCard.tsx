import React from 'react';
import { Plus, Edit2, CheckCircle, Circle } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Workout } from '../../types';
import { TrainingPhase } from '../../hooks/useTrainingPhases';

interface PlanningDayCardProps {
  date: Date;
  workouts: Workout[];
  onAdd: () => void;
  onEdit: (workout: Workout) => void;
  workoutTypeMap: Map<string, { name: string; color: string }>;
  currentPhase?: TrainingPhase;
}

export const PlanningDayCard: React.FC<PlanningDayCardProps> = ({
  date,
  workouts,
  onAdd,
  onEdit,
  workoutTypeMap,
  currentPhase,
}) => {
  const isCurrentDay = isToday(date);
  const formattedDay = format(date, 'EEEE', { locale: fr });
  const formattedDate = format(date, 'd MMMM', { locale: fr });

  // Phase color inheritance
  const phaseColor = currentPhase?.color;
  const phaseBgStyle = phaseColor ? {
      background: `linear-gradient(to right, ${phaseColor}15, transparent)`,
      borderLeft: `4px solid ${phaseColor}`
  } : {};

  return (
    <div className="relative group">
      {/* Container with Glassmorphism */}
      <div 
        className={`
          relative overflow-hidden rounded-2xl border transition-all duration-300
          ${isCurrentDay 
            ? 'bg-white/80 dark:bg-gray-800/80 border-sprint-primary/30 shadow-neumorphic-extrude dark:shadow-none' 
            : 'bg-white/40 dark:bg-gray-800/40 border-white/10 dark:border-white/5 hover:bg-white/60 dark:hover:bg-gray-800/60'
          }
          backdrop-blur-md min-h-[100px] flex flex-col md:flex-row md:items-center md:gap-4 p-4
        `}
        style={!isCurrentDay ? phaseBgStyle : { ...phaseBgStyle, borderLeft: `4px solid ${phaseColor || '#3B82F6'}` }}
      >
        {/* Phase Indicator Pill (Mobile only, effectively replaced by border-left but good to have explicit) */}
        {currentPhase && (
            <div className="absolute top-0 right-0 px-2 py-1 bg-white/50 dark:bg-black/20 rounded-bl-lg text-[10px] font-bold uppercase tracking-wider text-gray-500" style={{ color: phaseColor }}>
                {currentPhase.name}
            </div>
        )}

        {/* Date Section */}
        <div className="flex items-baseline justify-between md:flex-col md:justify-center md:w-32 md:flex-shrink-0 mb-3 md:mb-0">
            <div>
                <span className="block capitalize text-sm font-medium text-gray-500 dark:text-gray-400">
                    {formattedDay}
                </span>
                <span className={`text-xl font-bold ${isCurrentDay ? 'text-sprint-primary' : 'text-gray-900 dark:text-white'}`}>
                    {formattedDate}
                </span>
            </div>
             {/* Mobile Add Button (visible if no workouts) */}
            {workouts.length === 0 && (
                <button 
                    onClick={onAdd}
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-sprint-primary/10 text-sprint-primary active:scale-95 transition-transform"
                >
                    <Plus size={20} />
                </button>
            )}
        </div>

        {/* Workouts Section */}
        <div className="flex-1 flex flex-col gap-3">
          <AnimatePresence>
            {workouts.length > 0 ? (
              workouts.map((workout) => {
                const typeInfo = workout.tag_seance ? workoutTypeMap.get(workout.tag_seance) : null;
                const workoutName = typeInfo ? typeInfo.name : workout.title;
                const workoutColor = typeInfo ? typeInfo.color : '#6b7280';
                
                return (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => onEdit(workout)}
                    className="
                      relative overflow-hidden rounded-xl bg-white dark:bg-gray-900/50 
                      border border-gray-100 dark:border-gray-700/50
                      p-3 cursor-pointer hover:shadow-lg transition-shadow group/card
                    "
                  >
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5" 
                        style={{ backgroundColor: workoutColor }}
                    />
                    
                    <div className="flex items-center justify-between pl-3">
                        <div className="flex flex-col">
                             <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base truncate pr-2">
                                {workoutName}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className={`px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 capitalize`}>
                                    {workout.type}
                                </span>
                                {workout.status === 'completed' && (
                                    <span className="flex items-center text-green-500 font-medium">
                                        <CheckCircle size={12} className="mr-1" />
                                        Fait
                                    </span>
                                )}
                                {workout.status === 'planned' && (
                                    <span className="flex items-center text-gray-400">
                                        <Circle size={12} className="mr-1" />
                                        Prévu
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="opacity-0 group-hover/card:opacity-100 transition-opacity text-gray-400 hover:text-sprint-primary">
                            <Edit2 size={16} />
                        </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
                <div className="hidden md:flex items-center text-gray-400 dark:text-gray-600 italic text-sm py-2">
                    Aucune séance planifiée
                </div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Add Button (Always visible on hover or if empty) */}
        <div className="hidden md:flex items-center justify-end w-16">
             <button
                onClick={onAdd}
                className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${workouts.length === 0 
                        ? 'bg-sprint-primary/10 text-sprint-primary hover:bg-sprint-primary hover:text-white' 
                        : 'opacity-0 group-hover:opacity-100 bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-sprint-primary'
                    }
                `}
                title="Ajouter une séance"
             >
                 <Plus size={20} />
             </button>
        </div>

      </div>
    </div>
  );
};
