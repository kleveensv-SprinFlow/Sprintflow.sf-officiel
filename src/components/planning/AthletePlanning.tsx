import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, addDays, subDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';
import { Workout, WorkoutBlock } from '../../types';
import { PlanningDayCard } from './PlanningDayCard';
import { AthleteValidationModal } from '../workouts/athlete/AthleteValidationModal';
import { WorkoutDetailsModal } from '../workouts/WorkoutDetailsModal';

interface AthletePlanningProps {
  // onOpenWorkout is deprecated in favor of internal modals, but kept for compatibility if used elsewhere
  onOpenWorkout?: (workout: Workout) => void;
  initialView?: 'planning' | 'entrainement';
}

type CalendarView = 'planning' | 'entrainement';

// --- MOCK DATA FOR VISUALIZATION ---
const MOCK_WORKOUTS: Workout[] = [
    {
        id: 'mock-planned-1',
        title: 'Séance Vitesse',
        date: new Date().toISOString().split('T')[0], // Today
        status: 'planned',
        type: 'guidé',
        tag_seance: 'mock-type-1',
        user_id: 'mock-athlete-id',
        coach_id: 'mock-coach-id',
        planned_data: [
            { id: 'b1', type: 'course', distance: 30, duration: 0, reps: 4, series: 1, intensity_score: 8 },
            { id: 'b2', type: 'course', distance: 60, duration: 0, reps: 3, series: 1, intensity_score: 9 }
        ] as WorkoutBlock[],
        created_at: new Date().toISOString()
    },
    {
        id: 'mock-completed-1',
        title: 'Musculation Force',
        date: subDays(new Date(), 2).toISOString().split('T')[0], // 2 days ago
        status: 'completed',
        type: 'guidé',
        tag_seance: 'mock-type-2',
        user_id: 'mock-athlete-id',
        coach_id: 'mock-coach-id',
        planned_data: [],
        workout_data: [],
        created_at: new Date().toISOString()
    }
];

const MOCK_TYPES = [
    { id: 'mock-type-1', name: 'Vitesse', color: '#EF4444' }, // Red
    { id: 'mock-type-2', name: 'Force', color: '#8B5CF6' } // Purple
];

export const AthletePlanning: React.FC<AthletePlanningProps> = ({ initialView = 'planning' }) => {
  const { workouts, refresh, updateWorkout } = useWorkouts();
  const { allTypes: workoutTypes } = useWorkoutTypes();
  
  // Use mocks if workouts are empty (which they are in verified env)
  const displayWorkouts = workouts.length > 0 ? workouts : MOCK_WORKOUTS;
  // Use mock types map if real one empty
  
  const [currentView, setCurrentView] = useState<CalendarView>(initialView);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);

  // Modals state
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const workoutTypeMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    if (workoutTypes.length > 0) {
        workoutTypes.forEach(type => {
            map.set(type.id, { name: type.name, color: type.color });
        });
    } else {
        MOCK_TYPES.forEach(type => {
            map.set(type.id, { name: type.name, color: type.color });
        });
    }
    return map;
  }, [workoutTypes]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  // const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout);
    if (workout.status === 'planned' && workout.type === 'guidé') {
      setShowValidationModal(true);
    } else if (workout.status === 'completed') {
      setShowDetailsModal(true);
    } else {
        // Fallback for manuscript or other states
        // Maybe open details too?
        setShowDetailsModal(true);
    }
  };

  const handleValidateSession = async (finalBlocks: WorkoutBlock[]) => {
    if (!selectedWorkout) return;

    try {
        // Prepare the update
        // We only update workout_data and status
        // But useWorkouts.updateWorkout typically takes a full object. 
        // We should ensure we are careful.
        
        const updatedWorkout = {
            ...selectedWorkout,
            workout_data: finalBlocks,
            status: 'completed' as const,
            // Assuming the hook handles the DB update
        };

        await updateWorkout(selectedWorkout.id, updatedWorkout);
        
        setShowValidationModal(false);
        setSelectedWorkout(null);
        refresh(); // Refresh to show "Solid" state
    } catch (err) {
        console.error("Failed to validate workout", err);
        // Add toast here ideally
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

  const filteredWorkouts = useMemo(() => {
    // In athlete view we show all workouts relevant to the day, 
    // but the original code filtered by status based on view.
    // The requirement implies unifying the view or just updating the visuals.
    // "Transformer le flux ... en une expérience Mission Accomplie"
    // Let's show all workouts in 'planning' view, but sorted/filtered by day.
    
    if (currentView === 'planning') {
       return displayWorkouts;
    }
    // 'entrainement' view logic in original code was just showing 'completed'.
    // Maybe keep it for history?
    return displayWorkouts.filter(w => w.status === 'completed');
  }, [displayWorkouts, currentView]);

  const viewVariants = {
    enter: { opacity: 0 },
    center: { zIndex: 1, opacity: 1 },
    exit: { zIndex: 0, opacity: 0 },
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
    <div className="p-4 space-y-4">
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

      <div className="flex items-center justify-between gap-4 p-4 bg-sprint-light-surface dark:bg-sprint-dark-surface rounded-lg shadow">
        <button onClick={handlePrevWeek}><ChevronLeft /></button>
        <h2 className="text-lg font-semibold w-48 text-center">
            {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: fr })} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: fr })}
        </h2>
        <button onClick={handleNextWeek}><ChevronRight /></button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          variants={viewVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ opacity: { duration: 0.2 } }}
        >
          {currentView === 'planning' ? (
              <AnimatePresence initial={false} custom={direction}>
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
                  className="space-y-3"
                >
                  {days.map((day) => {
                    const workoutsForDay = filteredWorkouts.filter(w => isSameDay(parseISO(w.date), day));
                    
                    // Only show days with workouts or Today? 
                    // Usually planning shows all days. 
                    // Or maybe we can use the grid layout if preferred, but PlanningDayCard is a row.
                    // The previous layout was a grid of small cards. 
                    // Let's stack PlanningDayCards for vertical scrolling (better for mobile).
                    
                    return (
                        <div key={day.toString()}>
                            <PlanningDayCard
                                date={day}
                                workouts={workoutsForDay}
                                onAdd={() => {}} // Athlete doesn't add here usually
                                onEdit={handleWorkoutClick}
                                workoutTypeMap={workoutTypeMap}
                                isAthleteView={true}
                                // currentPhase={...} // TODO: Fetch phase if needed
                            />
                        </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
          ) : (
              // Historical view (simple list for now)
              <div className="space-y-3">
                  {filteredWorkouts.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">Aucun historique pour cette période.</div>
                  ) : (
                      filteredWorkouts.map(workout => (
                          <PlanningDayCard
                              key={workout.id}
                              date={parseISO(workout.date)}
                              workouts={[workout]}
                              onAdd={() => {}}
                              onEdit={handleWorkoutClick}
                              workoutTypeMap={workoutTypeMap}
                              isAthleteView={true}
                          />
                      ))
                  )}
              </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      {selectedWorkout && (
          <>
            <AthleteValidationModal 
                isOpen={showValidationModal}
                workout={selectedWorkout}
                onClose={() => {
                    setShowValidationModal(false);
                    setSelectedWorkout(null);
                }}
                onValidate={handleValidateSession}
            />

            <WorkoutDetailsModal 
                isOpen={showDetailsModal}
                workout={selectedWorkout}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedWorkout(null);
                }}
            />
          </>
      )}
    </div>
  );
};
