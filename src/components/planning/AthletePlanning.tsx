import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RPEModal } from '../workouts/RPEModal';
import { NewWorkoutForm } from '../workouts/NewWorkoutForm';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes'; // Importer
import { Workout } from '../../types';

const PlannedWorkoutModal: React.FC<{
  workout: Workout;
  onClose: () => void;
  onStart: (workout: Workout) => void;
}> = ({ workout, onClose, onStart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{workout.title}</h2>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Plan du coach :</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            {workout.planned_data?.blocs.map((bloc, index) => {
              let typeLabel = '';
              let summary = '';
              switch (bloc.type) {
                case 'course':
                  typeLabel = 'Course';
                  summary = bloc.data.distance ? `${bloc.data.distance}m` : '';
                  break;
                case 'muscu':
                  typeLabel = 'Musculation';
                  summary = bloc.data.exercice_nom || '';
                  break;
                case 'escalier':
                  typeLabel = 'Escalier';
                  summary = bloc.data.exercice_nom || (bloc.data.marches ? `${bloc.data.marches} marches` : '');
                  break;
                default:
                  typeLabel = 'Bloc';
              }
              return (
                <div key={index} className="text-sm">
                  <p><strong>{typeLabel}:</strong> {summary}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2">
            <button onClick={() => onStart(workout)} className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 font-bold">
            Commencer la Séance
            </button>
            <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-600 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
            Fermer
            </button>
        </div>
      </div>
    </div>
  );
};


export const AthletePlanning: React.FC = () => {
  const { workouts, completeWorkout, loading } = useWorkouts();
  const { allTypes: workoutTypes } = useWorkoutTypes();

  const workoutTypeMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    workoutTypes.forEach(type => {
      map.set(type.id, { name: type.name, color: type.color });
    });
    return map;
  }, [workoutTypes]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'form' | 'details' | 'rpe'>('calendar');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [completedWorkoutData, setCompletedWorkoutData] = useState<any>(null);

  const { planned, completed } = useMemo(() => {
    const planned = workouts.filter(w => w.status === 'planned');
    const completed = workouts.filter(w => w.status === 'completed');
    return { planned, completed };
  }, [workouts]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout);
    if (workout.status === 'planned') {
      setView('details');
    }
  };

  const handleStartWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setView('form');
  };

  const handleSaveCompletedWorkout = async (payload: { blocs: any[]; type: 'guidé' | 'manuscrit'; tag_seance: string; notes?: string; }) => {
    if (!selectedWorkout) return;
    setCompletedWorkoutData({ workout_data: { blocs: payload.blocs } });
    setView('rpe');
  };

  const handleSaveRPE = async (rpe: number) => {
      if (!selectedWorkout || !completedWorkoutData) return;

      await completeWorkout(selectedWorkout.id, {
          ...completedWorkoutData,
          rpe: rpe
      });

      setView('calendar');
      setSelectedWorkout(null);
      setCompletedWorkoutData(null);
  }

  if (view === 'details' && selectedWorkout) {
    return <PlannedWorkoutModal workout={selectedWorkout} onClose={() => setView('calendar')} onStart={handleStartWorkout} />;
  }
  if (view === 'form' && selectedWorkout) {
    return (
      <NewWorkoutForm
        onCancel={() => setView('calendar')}
        onSave={handleSaveCompletedWorkout}
        initialData={{
          tag_seance: selectedWorkout.tag_seance!,
          blocs: selectedWorkout.planned_data!.blocs,
          type: selectedWorkout.type
        }}
      />
    );
  }
  if (view === 'rpe' && selectedWorkout) {
      return <RPEModal onSubmit={handleSaveRPE} onCancel={() => setView('calendar')} />;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mon Calendrier</h1>

      <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></button>
        <h2 className="text-lg font-semibold w-32 text-center">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 bg-white dark:bg-gray-800 p-2 rounded-lg shadow">
        {weekDays.map(day => <div key={day} className="text-center font-bold text-sm">{day}</div>)}

        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          const plannedForDay = planned.filter(w => isSameDay(parseISO(w.date), day));
          const completedForDay = completed.filter(w => isSameDay(parseISO(w.date), day));

          return (
            <div
              key={day.toString()}
              className={`h-32 border rounded-lg p-1 flex flex-col ${isCurrentMonth ? '' : 'bg-gray-100 dark:bg-gray-700 opacity-50'} ${isToday ? 'border-primary-500' : ''}`}
            >
              <span className={`font-semibold ${isToday ? 'text-primary-500' : ''}`}>{format(day, 'd')}</span>
              <div className="flex-grow overflow-y-auto text-xs space-y-1 mt-1 pr-1">
                {plannedForDay.map(w => {
                  const typeInfo = w.tag_seance ? workoutTypeMap.get(w.tag_seance) : null;
                  const workoutName = typeInfo ? typeInfo.name : w.title;
                  const workoutColor = typeInfo ? typeInfo.color : '#3b82f6'; // Bleu par défaut
                  return (
                    <div key={w.id} onClick={() => handleWorkoutClick(w)} className="p-1 bg-gray-100 dark:bg-gray-700/80 rounded-md truncate cursor-pointer" title={workoutName} style={{ borderLeft: `3px solid ${workoutColor}`}}>
                      <Clock size={12} className="inline mr-1"/>{workoutName}
                    </div>
                  );
                })}
                {completedForDay.map(w => {
                  const typeInfo = w.tag_seance ? workoutTypeMap.get(w.tag_seance) : null;
                  const workoutName = typeInfo ? typeInfo.name : w.title;
                  const workoutColor = typeInfo ? typeInfo.color : '#22c55e'; // Vert par défaut
                  return (
                    <div key={w.id} onClick={() => handleWorkoutClick(w)} className="p-1 bg-gray-100 dark:bg-gray-700/80 rounded-md truncate" title={workoutName} style={{ borderLeft: `3px solid ${workoutColor}`}}>
                      <CheckCircle size={12} className="inline mr-1"/>{workoutName}
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
export default AthletePlanning;
