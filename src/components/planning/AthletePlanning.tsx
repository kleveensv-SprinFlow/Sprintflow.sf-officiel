import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, addDays, subDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';
import { Workout } from '../../types';

interface AthletePlanningProps {
  onOpenWorkout?: (workout: Workout) => void;
}

type CalendarView = 'planning' | 'entrainement';

export const AthletePlanning: React.FC<AthletePlanningProps> = ({ onOpenWorkout }) => {
  const { workouts, loading } = useWorkouts();
  const { allTypes: workoutTypes } = useWorkoutTypes();
  
  const [currentView, setCurrentView] = useState<CalendarView>('planning');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const handleWorkoutClick = (workout: Workout) => {
    if (onOpenWorkout && workout.type === 'guidé' && workout.status === 'planned') {
      onOpenWorkout(workout);
    }
  };

  const filteredWorkouts = useMemo(() => {
    if (currentView === 'planning') {
      return workouts.filter(w => w.status === 'planned');
    }
    return workouts.filter(w => w.status === 'completed');
  }, [workouts, currentView]);

  const variants = {
    enter: {
      x: '100%',
      opacity: 0,
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: {
      zIndex: 0,
      x: '-100%',
      opacity: 0,
    },
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-center mb-4">
        <div className="relative flex p-1 bg-white/20 backdrop-blur-lg border border-white/10 rounded-full shadow-lg">
          <button
            onClick={() => setCurrentView('planning')}
            className={`relative w-32 py-2 text-sm font-semibold rounded-full transition-colors ${
              currentView === 'planning' ? 'text-white' : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            Planning
          </button>
          <button
            onClick={() => setCurrentView('entrainement')}
            className={`relative w-32 py-2 text-sm font-semibold rounded-full transition-colors ${
              currentView === 'entrainement' ? 'text-white' : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            Entraînement
          </button>
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 z-[-1] bg-primary-500 rounded-full"
            animate={{ x: currentView === 'planning' ? '0%' : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <button onClick={() => setCurrentDate(subDays(currentDate, 7))}><ChevronLeft /></button>
        <h2 className="text-lg font-semibold w-48 text-center">
            {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: fr })} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: fr })}
        </h2>
        <button onClick={() => setCurrentDate(addDays(currentDate, 7))}><ChevronRight /></button>
      </div>

      <div className="hidden md:grid grid-cols-7 gap-2 text-center font-bold mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="grid grid-cols-1 md:grid-cols-7 gap-2"
        >
          {days.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const workoutsForDay = filteredWorkouts.filter(w => isSameDay(parseISO(w.date), day));

            return (
              <div
                key={day.toString()}
                className={`min-h-[12rem] rounded-lg p-2 flex flex-col relative transition-shadow hover:shadow-lg card-glass ${isToday ? 'border-2 border-primary-500' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-bold md:hidden ${isToday ? 'text-primary-600' : ''}`}>{weekDays[index]}</span>
                  <span className={`font-semibold text-lg ${isToday ? 'text-primary-500' : ''}`}>{format(day, 'd')}</span>
                </div>

                <div className="flex-grow overflow-y-auto text-sm space-y-2 pr-2">
                  {workoutsForDay.map(w => {
                    const typeInfo = w.tag_seance ? workoutTypeMap.get(w.tag_seance) : null;
                    const workoutName = typeInfo ? typeInfo.name : w.title;
                    const workoutColor = typeInfo ? typeInfo.color : '#6b7280';

                    return (
                      <div
                        key={w.id}
                        onClick={() => handleWorkoutClick(w)}
                        className="p-2 rounded-lg shadow-sm truncate bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
                        style={{ borderLeft: `4px solid ${workoutColor}` }}
                        title={workoutName}
                      >
                        {w.status === 'planned' ? (
                            <Clock size={12} className="inline mr-1 opacity-80"/>
                        ) : (
                            <CheckCircle size={12} className="inline mr-1 text-green-500"/>
                        )}
                        <span className="font-semibold">{workoutName}</span>
                        <p className="text-xs opacity-80">{w.type === 'guidé' ? 'Guidée' : 'Manuscrit'}</p>
                        {w.status === 'completed' && w.rpe && (
                          <p className="font-bold text-xs mt-1">RPE: {w.rpe}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};