import React from 'react';
import { Plus, Edit2, CheckCircle, Circle, Clock, Activity, Zap } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Workout } from '../../types';

interface PlanningDayCardProps {
  date: Date;
  workouts: Workout[];
  onAdd: () => void;
  onEdit: (workout: Workout) => void;
  workoutTypeMap: Map<string, { name: string; color: string }>;
  isReadOnly?: boolean; // For Athlete view (read-only for planning, but can perform) - actually athlete performs via another flow?
  // Let's stick to existing props + userRole logic if needed, or pass canAdd
  canAdd?: boolean;
}

export const PlanningDayCard: React.FC<PlanningDayCardProps> = ({
  date,
  workouts,
  onAdd,
  onEdit,
  workoutTypeMap,
  canAdd = true, // Default to true (Coach view)
}) => {
  const isCurrentDay = isToday(date);
  const formattedDay = format(date, 'EEEE', { locale: fr });
  const formattedDate = format(date, 'd MMMM', { locale: fr });

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
      >
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
             {/* Mobile Add Button (visible if no workouts and allowed) */}
            {canAdd && workouts.length === 0 && (
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
                const isCompleted = workout.status === 'completed';
                
                // Retrieve Metadata
                // Duration: prefer actual duration if completed, else planned duration (top level or from planned_data)
                // Note: Types might not have duration_minutes on top level yet if not migrated, check planned_data
                const plannedDuration = workout.duration_minutes || (workout.planned_data as any)?.duration;
                const rpeTarget = (workout.planned_data as any)?.rpe_target;
                const actualRpe = workout.rpe;

                return (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => onEdit(workout)}
                    className={`
                      relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer group/card
                      ${isCompleted
                        ? 'bg-green-50/50 dark:bg-green-900/10 border border-green-500/30 shadow-[inset_0_0_12px_rgba(34,197,94,0.1)]'
                        : 'bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 hover:shadow-lg'
                      }
                      p-3
                    `}
                  >
                    {/* Color Strip */}
                    <div 
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCompleted ? 'bg-green-500' : ''}`}
                        style={{ backgroundColor: isCompleted ? undefined : workoutColor }}
                    />
                    
                    <div className="flex items-center justify-between pl-3">
                        <div className="flex flex-col gap-1">
                             <h4 className={`font-bold text-sm md:text-base truncate pr-2 ${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                {workoutName}
                            </h4>

                            {/* Metadata Row */}
                            <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">

                                {/* Status Badge */}
                                {isCompleted ? (
                                    <span className="flex items-center text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                        <CheckCircle size={12} className="mr-1" />
                                        Terminé
                                    </span>
                                ) : (
                                    <span className="flex items-center text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                                        <Circle size={12} className="mr-1" />
                                        Prévu
                                    </span>
                                )}

                                {/* Duration */}
                                {plannedDuration && (
                                  <span className="flex items-center gap-1" title="Durée estimée">
                                    <Clock size={12} />
                                    {plannedDuration} min
                                  </span>
                                )}

                                {/* Intensity / RPE */}
                                {(rpeTarget || actualRpe) && (
                                  <span className="flex items-center gap-1" title={isCompleted ? "RPE Ressenti" : "Intensité Cible"}>
                                    <Activity size={12} className={isCompleted ? "text-green-500" : "text-orange-400"} />
                                    {isCompleted ? `RPE ${actualRpe}` : `Cible ${rpeTarget}`}
                                  </span>
                                )}
                            </div>
                        </div>

                        {/* Edit/Action Icon */}
                        <div className="opacity-0 group-hover/card:opacity-100 transition-opacity text-gray-400 hover:text-sprint-primary pl-2">
                           <Edit2 size={16} />
                        </div>
                    </div>

                    {/* Micro-animation shine effect for completed */}
                    {isCompleted && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-200%] animate-[shimmer_2s_infinite]" />
                    )}
                  </motion.div>
                );
              })
            ) : (
                <div className="hidden md:flex items-center text-gray-400 dark:text-gray-600 italic text-sm py-2">
                    {canAdd ? "Aucune séance planifiée" : "Repos"}
                </div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Add Button (Always visible on hover or if empty) - ONLY IF canAdd is true */}
        {canAdd && (
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
        )}

      </div>
    </div>
  );
};
