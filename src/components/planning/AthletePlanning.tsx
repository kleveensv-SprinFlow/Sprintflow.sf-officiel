import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, addDays, subDays, parseISO, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';
import { Workout } from '../../types';

interface AthletePlanningProps {
  onOpenWorkout?: (workout: Workout) => void;
}

export const AthletePlanning: React.FC<AthletePlanningProps> = ({ onOpenWorkout }) => {
  const { workouts, loading } = useWorkouts();
  const { allTypes: workoutTypes } = useWorkoutTypes();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);

  const workoutTypeMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    workoutTypes.forEach(type => {
      map.set(type.id, { name: type.name, color: type.color });
    });
    return map;
  }, [workoutTypes]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Calculate Weekly Progress
  const weeklyStats = useMemo(() => {
    const currentWeekWorkouts = workouts.filter(w => {
      const wDate = parseISO(w.date);
      return wDate >= weekStart && wDate <= weekEnd;
    });

    const planned = currentWeekWorkouts.length; // Or count planned status? Usually count all in week
    const completed = currentWeekWorkouts.filter(w => w.status === 'completed').length;
    const progress = planned > 0 ? (completed / planned) * 100 : 0;

    return { completed, planned, progress };
  }, [workouts, weekStart, weekEnd]);

  const handleWorkoutClick = (workout: Workout) => {
    if (onOpenWorkout && workout.type === 'guidé' && workout.status === 'planned') {
      onOpenWorkout(workout);
    }
  };

  const handlePrevWeek = () => {
    setDirection(-1);
    setCurrentDate(subDays(currentDate, 7));
  };

  const handleNextWeek = () => {
    setDirection(1);
    setCurrentDate(addDays(currentDate, 7));
  };

  const weekVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">

      {/* --- Gamification Header: Weekly Progress --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
              <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ma Semaine</h2>
                  <p className="text-xs text-gray-500">{weeklyStats.completed} sur {weeklyStats.planned} séances complétées</p>
              </div>
              <div className="text-2xl font-black text-sprint-primary">{Math.round(weeklyStats.progress)}%</div>
          </div>
          {/* Progress Bar */}
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sprint-primary to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${weeklyStats.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
          </div>
      </div>

      {/* --- Unified Calendar Navigation --- */}
      <div className="flex items-center justify-between gap-4 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
        <button onClick={handlePrevWeek} className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"><ChevronLeft /></button>
        <h2 className="text-base font-bold text-gray-900 dark:text-white capitalize">
            {format(weekStart, 'd MMMM', { locale: fr })} - {format(weekEnd, 'd MMMM', { locale: fr })}
        </h2>
        <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"><ChevronRight /></button>
      </div>

      <div className="hidden md:grid grid-cols-7 gap-2 text-center font-bold text-gray-400 text-sm mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>

      <AnimatePresence initial={false} custom={direction} mode='wait'>
        <motion.div
            key={weekStart.toString()}
            custom={direction}
            variants={weekVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
            }}
            className="grid grid-cols-1 md:grid-cols-7 gap-3"
        >
            {days.map((day, index) => {
            const isTodayDate = isSameDay(day, new Date());
            const workoutsForDay = workouts.filter(w => isSameDay(parseISO(w.date), day));
            // Sort: completed first, then planned
            workoutsForDay.sort((a, b) => (a.status === 'completed' ? -1 : 1));

            return (
                <div
                key={day.toString()}
                className={`
                    min-h-[140px] rounded-2xl p-3 flex flex-col relative transition-all
                    ${isTodayDate
                        ? 'bg-white/90 dark:bg-gray-800/90 border-2 border-sprint-primary/50 shadow-lg'
                        : 'bg-white/40 dark:bg-gray-800/40 border border-white/10 hover:bg-white/60'
                    }
                    backdrop-blur-sm
                `}
                >
                <div className="flex justify-between items-center mb-3">
                    <span className={`font-bold md:hidden text-sm ${isTodayDate ? 'text-sprint-primary' : 'text-gray-500'}`}>{weekDays[index]}</span>
                    <span className={`font-bold text-lg ${isTodayDate ? 'text-sprint-primary' : 'text-gray-900 dark:text-white'}`}>{format(day, 'd')}</span>
                </div>

                <div className="flex-grow flex flex-col gap-2">
                    {workoutsForDay.length > 0 ? (
                        workoutsForDay.map(w => {
                            const typeInfo = w.tag_seance ? workoutTypeMap.get(w.tag_seance) : null;
                            const workoutName = typeInfo ? typeInfo.name : w.title;
                            const workoutColor = typeInfo ? typeInfo.color : '#6b7280';
                            const isCompleted = w.status === 'completed';
                            const plannedDuration = w.duration_minutes || (w.planned_data as any)?.duration;

                            return (
                                <motion.div
                                key={w.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleWorkoutClick(w)}
                                className={`
                                    relative overflow-hidden rounded-xl p-2 cursor-pointer transition-shadow
                                    ${isCompleted
                                        ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-100 dark:border-gray-600'
                                    }
                                `}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {isCompleted ? <CheckCircle size={14} className="text-white"/> : <Clock size={14} className="text-gray-400"/>}
                                        <span className="font-bold text-xs truncate flex-1">{workoutName}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] opacity-90">
                                        <span>{isCompleted ? 'Terminé' : 'À faire'}</span>
                                        {plannedDuration && <span>{plannedDuration} min</span>}
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-300 dark:text-gray-600">
                             <span className="text-xs font-medium">Repos</span>
                        </div>
                    )}
                </div>
                </div>
            );
            })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
