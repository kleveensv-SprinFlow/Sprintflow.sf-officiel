import React from 'react';
import { Plus, Edit2, CheckCircle, Circle, Clock, Check } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Workout } from '../../types';
import { PlanningPhase } from '../../types/planning';

interface PlanningDayCardProps {
  date: Date;
  workouts: Workout[];
  onAdd: () => void;
  onEdit: (workout: Workout) => void;
  workoutTypeMap: Map<string, { name: string; color: string }>;
  currentPhase?: PlanningPhase;
  isAthleteView?: boolean;
}

export const PlanningDayCard: React.FC<PlanningDayCardProps> = ({
  date,
  workouts,
  onAdd,
  onEdit,
  workoutTypeMap,
  currentPhase,
  isAthleteView = false,
}) => {
  const isCurrentDay = isToday(date);
  const formattedDay = format(date, 'EEEE', { locale: fr });
  const formattedDate = format(date, 'd MMMM', { locale: fr });

  // Phase Styling
  const phaseBorderColor = currentPhase ? currentPhase.color_hex : 'transparent';
  const phaseBgStyle = currentPhase 
    ? { backgroundColor: `${currentPhase.color_hex}10` } // Hex alpha ~6%
    : {};

  return (
    <div className="relative group">
      {/* Container with Glassmorphism */}
      <div 
        className={`
          relative overflow-hidden rounded-2xl border transition-all duration-300
          ${isCurrentDay 
            ? 'bg-white/90 dark:bg-gray-800/90 border-sprint-primary/30 shadow-md'
            : 'bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-white/5'
          }
          backdrop-blur-md min-h-[100px] flex flex-col md:flex-row md:items-center md:gap-4 p-4
        `}
        style={!isCurrentDay ? phaseBgStyle : {}}
      >
        {/* Phase Indicator Border */}
        {currentPhase && (
            <div 
                className="absolute left-0 top-0 bottom-0 w-1.5 z-10"
                style={{ backgroundColor: phaseBorderColor }}
            />
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
             {/* Mobile Add Button (visible if no workouts) - HIDDEN for Athlete */}
            {!isAthleteView && workouts.length === 0 && (
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
                
                const isPlanned = workout.status === 'planned';
                const isCompleted = workout.status === 'completed';

                // Apply Ghost styling only if it's Athlete View AND Planned
                const useGhostStyle = isAthleteView && isPlanned;

                // Ghost Style (Planned & Athlete)
                const ghostClasses = "opacity-80 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-transparent hover:opacity-100";
                const ghostStyle = { borderLeftColor: workoutColor };

                // Solid Style (Completed OR Coach View)
                const solidClasses = "shadow-lg bg-white dark:bg-gray-800 border-l-4 opacity-100";
                const solidStyle = { borderLeftColor: workoutColor };

                return (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => onEdit(workout)}
                    className={`
                      relative overflow-hidden rounded-xl p-3 cursor-pointer transition-all duration-300 group/card
                      ${useGhostStyle ? ghostClasses : solidClasses}
                    `}
                    style={useGhostStyle ? ghostStyle : solidStyle}
                  >
                    <div className="flex items-center justify-between pl-2">
                        <div className="flex flex-col">
                             <h4 className={`font-bold text-sm md:text-base truncate pr-2 ${isPlanned ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {workoutName}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span className={`px-1.5 py-0.5 rounded-md border capitalize ${isPlanned ? 'bg-transparent border-gray-300' : 'bg-gray-100 dark:bg-gray-700 border-transparent'}`}>
                                    {workout.type}
                                </span>
                                {isCompleted && (
                                    <span className="flex items-center text-green-600 font-bold bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                                        <Check size={10} strokeWidth={4} className="mr-1" />
                                        FAIT
                                    </span>
                                )}
                                {isPlanned && (
                                    <span className="flex items-center text-gray-400">
                                        <Clock size={12} className="mr-1" />
                                        Planifié
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Edit Icon */}
                        <div className="opacity-0 group-hover/card:opacity-100 transition-opacity text-gray-400 hover:text-sprint-primary">
                            {isAthleteView ? (
                                isPlanned ? <CheckCircle size={20} className="text-sprint-primary"/> : <div/>
                            ) : (
                                <Edit2 size={16} />
                            )}
                        </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
                <div className="hidden md:flex items-center text-gray-400 dark:text-gray-600 italic text-sm py-2">
                    {isAthleteView ? "Repos" : "Aucune séance planifiée"}
                </div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Add Button (Coach Only) */}
        {!isAthleteView && (
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
