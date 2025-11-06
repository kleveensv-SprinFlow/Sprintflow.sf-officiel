import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, addDays, subDays, parseISO } from 'date-fns';
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

  const workoutTypeMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    workoutTypes.forEach(type => {
      map.set(type.id, { name: type.name, color: type.color });
    });
    return map;
  }, [workoutTypes]);

  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handleWorkoutClick = (workout: Workout) => {
    if (onOpenWorkout && workout.type === 'guidé' && workout.status === 'planned') {
      onOpenWorkout(workout);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mon Planning</h1>

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

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {days.map((day, index) => {
          const isToday = isSameDay(day, new Date());

          const workoutsForDay = workouts.filter(w => {
            const dateToCompare = w.date;
            return isSameDay(parseISO(dateToCompare), day);
          });

          return (
            <div
              key={day.toString()}
              className={`min-h-[12rem] rounded-lg p-2 flex flex-col relative transition-shadow hover:shadow-lg ${isToday ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-white dark:bg-gray-800'}`}
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
                      style={{
                        borderLeft: `4px solid ${workoutColor}`
                      }}
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
      </div>
    </div>
  );
};
