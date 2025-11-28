import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, addDays, subDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';
import { useTrainingPhases } from '../../hooks/useTrainingPhases';
import { Workout } from '../../types';
import { PlanningDayCard } from './PlanningDayCard';
import { AthleteValidationModal } from '../workouts/AthleteValidationModal';
import { WorkoutDetailsModal } from '../workouts/WorkoutDetailsModal';
import { WorkoutBlock } from '../../types/workout';

interface AthletePlanningProps {
  onOpenWorkout?: (workout: Workout) => void;
  initialView?: 'planning' | 'entrainement';
}

type CalendarView = 'planning' | 'entrainement';

export const AthletePlanning: React.FC<AthletePlanningProps> = ({ initialView = 'planning' }) => {
  const { workouts, loading, updateWorkout } = useWorkouts();
  const { allTypes: workoutTypes } = useWorkoutTypes();
  const { getPhaseForDate } = useTrainingPhases();
  
  const [currentView, setCurrentView] = useState<CalendarView>(initialView);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modals
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

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

  // Filter workouts based on view toggle
  const filteredWorkouts = useMemo(() => {
    if (currentView === 'planning') {
      // Show ALL workouts in the calendar view so we see Ghost AND Solid
      return workouts;
    }
    // For 'entrainement' view (history), maybe show all completed?
    return workouts.filter(w => w.status === 'completed');
  }, [workouts, currentView]);

  const handleWorkoutClick = (workout: Workout) => {
      setSelectedWorkout(workout);
      if (workout.status === 'planned') {
          // Open "Ghost" -> Validation Flow
          setValidationModalOpen(true);
      } else {
          // Open "Solid" -> Details Flow (ReadOnly)
          setDetailsModalOpen(true);
      }
  };

  const handleValidation = async (actualBlocks: WorkoutBlock[], notes?: string, rpe?: number) => {
      if (!selectedWorkout) return;

      const payload = {
          workout_data: {
              blocs: actualBlocks,
              tag_seance: selectedWorkout.tag_seance || '',
              type: selectedWorkout.type,
              notes: notes || selectedWorkout.notes
          },
          status: 'completed' as const,
          rpe: rpe || selectedWorkout.rpe,
      };

      await updateWorkout(selectedWorkout.id, payload);
      setValidationModalOpen(false);
      setSelectedWorkout(null);
  };

  const handlePrevWeek = () => setCurrentDate(subDays(currentDate, 7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto pb-24">

      {/* View Toggle */}
      <div className="flex justify-center mb-4">
        <div className="flex w-full max-w-xs p-1 space-x-1 bg-sprint-light-surface dark:bg-sprint-dark-surface rounded-full">
          <button
            onClick={() => setCurrentView('planning')}
            className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors ${
              currentView === 'planning'
                ? 'bg-white text-sprint-light-text-primary dark:bg-gray-200 dark:text-sprint-dark-text-primary shadow'
                : 'text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary'
            }`}
          >
            Planning
          </button>
          <button
            onClick={() => setCurrentView('entrainement')}
            className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors ${
              currentView === 'entrainement'
                ? 'bg-white text-sprint-light-text-primary dark:bg-gray-200 dark:text-sprint-dark-text-primary shadow'
                : 'text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary'
            }`}
          >
            Historique
          </button>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm">
        <button onClick={handlePrevWeek} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><ChevronLeft /></button>
        <div className="text-center">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Semaine du</span>
            <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                {format(weekStart, 'd MMM', { locale: fr })} - {format(weekEnd, 'd MMM', { locale: fr })}
            </span>
        </div>
        <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><ChevronRight /></button>
      </div>

      {/* Days List */}
      <div className="space-y-3">
        {days.map(day => {
            const dayWorkouts = filteredWorkouts.filter(w => isSameDay(parseISO(w.date), day));
            const currentPhase = getPhaseForDate(day);

            return (
                <PlanningDayCard
                    key={day.toISOString()}
                    date={day}
                    workouts={dayWorkouts}
                    onAdd={() => {}}
                    onEdit={handleWorkoutClick}
                    workoutTypeMap={workoutTypeMap}
                    currentPhase={currentPhase || undefined}
                    isAthleteView={true}
                />
            );
        })}
      </div>

      {/* Modals */}
      <AthleteValidationModal
          isOpen={validationModalOpen}
          workout={selectedWorkout}
          onClose={() => setValidationModalOpen(false)}
          onValidate={handleValidation}
      />

      <WorkoutDetailsModal
          isOpen={detailsModalOpen}
          workout={selectedWorkout}
          onClose={() => setDetailsModalOpen(false)}
          canEdit={false}
      />

    </div>
  );
};
