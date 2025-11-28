import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Copy, Clipboard, AlertCircle } from 'lucide-react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, addDays, subDays, parseISO, differenceInCalendarDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';

import { useWorkouts } from '../../hooks/useWorkouts';
import { useGroups } from '../../hooks/useGroups';
import { useCoachLinks } from '../../hooks/useCoachLinks';
import useAuth from '../../hooks/useAuth';
import { WorkoutTemplate } from '../../hooks/useWorkoutTemplates';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';

import { TemplateSelectionModal } from '../workouts/TemplateSelectionModal';
import { NewWorkoutForm } from '../workouts/NewWorkoutForm';
import { WorkoutDetailsModal } from '../workouts/WorkoutDetailsModal';
import { PlanningDayCard } from './PlanningDayCard';
import { Workout } from '../../types';

type ActiveFilter = {
  type: 'group' | 'athlete';
  id: string;
  name: string;
};

type SelectionType = 'group' | 'athlete';

interface CoachPlanningProps {
  initialSelection?: { type: 'athlete' | 'group'; id: string };
  onBack?: () => void;
}

export const CoachPlanning: React.FC<CoachPlanningProps> = ({ initialSelection, onBack }) => {
  const { user } = useAuth();
  // Pass the active filter to useWorkouts to fetch relevant data
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null);
  const selectionForHook = useMemo(() => {
    if (!activeFilter) return undefined;
    return { type: activeFilter.type, id: activeFilter.id };
  }, [activeFilter]);

  const { workouts, planWorkout, batchPlanWorkouts } = useWorkouts(selectionForHook);
  const { groups, loading: loadingGroups } = useGroups();
  const { linkedAthletes, loading: loadingAthletes } = useCoachLinks(user?.id);
  const { allTypes: workoutTypes } = useWorkoutTypes();

  const workoutTypeMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    workoutTypes.forEach(type => {
      map.set(type.id, { name: type.name, color: type.color });
    });
    return map;
  }, [workoutTypes]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectionType, setSelectionType] = useState<SelectionType>(initialSelection?.type || 'athlete');

  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isWorkoutFormOpen, setWorkoutFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [initialWorkoutData, setInitialWorkoutData] = useState<any>(null);
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);
  
  // Clipboard state for Copy/Paste Week
  const [weekClipboard, setWeekClipboard] = useState<Workout[] | null>(null);

  // Initialize activeFilter from initialSelection if provided
  useEffect(() => {
    if (initialSelection && !activeFilter) {
      if (initialSelection.type === 'athlete' && !loadingAthletes) {
        const a = linkedAthletes.find(l => l.id === initialSelection.id);
        if (a) setActiveFilter({ type: 'athlete', id: a.id, name: `${a.first_name} ${a.last_name}` });
      } else if (initialSelection.type === 'group' && !loadingGroups) {
        const g = groups.find(gr => gr.id === initialSelection.id);
        if (g) setActiveFilter({ type: 'group', id: g.id, name: g.name });
      }
    }
  }, [initialSelection, loadingAthletes, linkedAthletes, loadingGroups, groups, activeFilter]);

  useEffect(() => {
    // Logic to select the first available item if nothing is selected and no initialSelection
    if (!activeFilter && !initialSelection) {
      if (selectionType === 'athlete' && !loadingAthletes && linkedAthletes.length > 0) {
        const firstAthlete = linkedAthletes[0];
        setActiveFilter({ type: 'athlete', id: firstAthlete.id, name: `${firstAthlete.first_name} ${firstAthlete.last_name}` });
      } else if (selectionType === 'group' && !loadingGroups && groups.length > 0) {
        const firstGroup = groups[0];
        setActiveFilter({ type: 'group', id: firstGroup.id, name: firstGroup.name });
      }
    }
  }, [activeFilter, selectionType, loadingAthletes, linkedAthletes, loadingGroups, groups, initialSelection]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const filteredWorkouts = useMemo(() => {
    // Filter workouts to only show those that belong to the current filter
    // Note: useWorkouts hook already filters by API, but we double check client side or for completed workouts
    if (!activeFilter) return [];
    
    // The useWorkouts hook with 'selection' arg returns exactly what we need, so we just return 'workouts'
    // However, if we want to be safe about the date range (though not strictly necessary for display if we map by day)
    return workouts; 
  }, [workouts, activeFilter]);

  const handleAddWorkout = (date: Date) => {
    if (!activeFilter) {
      toast.error("Veuillez d'abord sélectionner un athlète ou un groupe.");
      return;
    }
    setSelectedDate(date);
    setTemplateModalOpen(true);
  };

  const handleCreateNewWorkout = () => {
    setTemplateModalOpen(false);
    setInitialWorkoutData(null);
    setWorkoutFormOpen(true);
  };

  const handleSelectTemplate = (template: WorkoutTemplate) => {
    setTemplateModalOpen(false);
    setInitialWorkoutData({
      title: template.template_name,
      blocs: template.workout_data.blocs
    });
    setWorkoutFormOpen(true);
  };

  const handleSaveWorkout = async (payload: { blocs: any[]; type: 'guidé' | 'manuscrit'; tag_seance: string; notes?: string; }) => {
    if (!selectedDate || !activeFilter) return;

    const workoutTypeName = workoutTypeMap.get(payload.tag_seance)?.name || 'Séance';

    const planningPayload: any = {
      title: workoutTypeName,
      type: payload.type,
      tag_seance: payload.tag_seance,
      notes: payload.notes,
      planned_data: { blocs: payload.blocs },
      date: format(selectedDate, 'yyyy-MM-dd'),
    };

    if (activeFilter.type === 'group') {
      planningPayload.assigned_to_group_id = activeFilter.id;
    } else {
      planningPayload.assigned_to_user_id = activeFilter.id;
    }

    try {
        await planWorkout(planningPayload);
        toast.success("Séance planifiée avec succès");
        setWorkoutFormOpen(false);
    } catch (e) {
        toast.error("Erreur lors de la planification");
        console.error(e);
    }
  };

  const copyWeek = () => {
      // Get all workouts visible in the current week
      const currentWeekWorkouts = filteredWorkouts.filter(w => {
          const wDate = parseISO(w.date);
          return wDate >= weekStart && wDate <= weekEnd;
      });

      if (currentWeekWorkouts.length === 0) {
          toast.info("Aucune séance à copier pour cette semaine.");
          return;
      }

      setWeekClipboard(currentWeekWorkouts);
      toast.success(`${currentWeekWorkouts.length} séances copiées !`);
  };

  const pasteWeek = async () => {
      if (!weekClipboard || weekClipboard.length === 0) {
          toast.error("Le presse-papier est vide.");
          return;
      }
      if (!activeFilter) return;

      // Calculate the start of the week where the source workouts came from
      // We assume the clipboard contains workouts from a single week.
      // We take the date of the first workout in clipboard to determine the "source Monday"
      const sourceDate = parseISO(weekClipboard[0].date);
      const sourceWeekStart = startOfWeek(sourceDate, { weekStartsOn: 1 });
      
      const targetWeekStart = weekStart; // The Monday of the currently viewed week

      const newPlannings = weekClipboard.map(w => {
          const originalDate = parseISO(w.date);
          // Calculate day offset from Monday (0 to 6)
          const dayOffset = differenceInCalendarDays(originalDate, sourceWeekStart);
          // Calculate new date
          const newDate = addDays(targetWeekStart, dayOffset);
          
          return {
              date: format(newDate, 'yyyy-MM-dd'),
              type: w.type,
              tag_seance: w.tag_seance,
              notes: w.notes,
              // Use planned_data if available (status planned), or construct it from workout_data if completed
              planned_data: w.planned_data || w.workout_data, 
              assigned_to_user_id: activeFilter.type === 'athlete' ? activeFilter.id : undefined,
              assigned_to_group_id: activeFilter.type === 'group' ? activeFilter.id : undefined,
          };
      });

      if (confirm(`Voulez-vous coller ${newPlannings.length} séances sur la semaine du ${format(targetWeekStart, 'd MMM')} ?`)) {
          try {
            await batchPlanWorkouts(newPlannings);
            toast.success("Semaine collée avec succès !");
            setWeekClipboard(null); // Optional: Clear clipboard or keep it for multiple pastes
          } catch (e) {
              console.error(e);
              toast.error("Erreur lors du collage de la semaine.");
          }
      }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-3xl mx-auto min-h-screen">
      
      {/* --- HEADER --- */}
      <header className="mb-6 space-y-4">
        
        {/* Back Button if requested */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold mb-2 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft size={20} /> Retour au choix
          </button>
        )}

        {/* Context Selector (Athlete/Group) - Hide if locked to initial selection? Or keep to allow switching?
            Let's keep it but maybe minimize it or just keep it as is.
            User said "Une fois la cible choisie, on bascule sur la vue calendrier correspondante".
            If we are in a deep focus mode, maybe we don't need the big switcher.
            But for now, I'll keep it visible so it's not a breaking change.
        */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row gap-2">
           {/* Type Toggles */}
           <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl shrink-0">
               <button
                  onClick={() => { setSelectionType('athlete'); setActiveFilter(null); }}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectionType === 'athlete' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-sprint-primary' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
               >
                   Athlètes
               </button>
               <button
                  onClick={() => { setSelectionType('group'); setActiveFilter(null); }}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectionType === 'group' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-sprint-primary' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
               >
                   Groupes
               </button>
           </div>

           {/* Dropdown */}
           <div className="flex-1 px-1">
               <select
                 className="w-full h-full bg-transparent font-semibold text-gray-900 dark:text-white outline-none cursor-pointer py-2"
                 value={activeFilter?.id || ''}
                 onChange={(e) => {
                   const id = e.target.value;
                   if (selectionType === 'athlete') {
                     const a = linkedAthletes.find(l => l.id === id);
                     if (a) setActiveFilter({ type: 'athlete', id: a.id, name: `${a.first_name} ${a.last_name}`});
                   } else {
                     const g = groups.find(gr => gr.id === id);
                     if (g) setActiveFilter({ type: 'group', id: g.id, name: g.name });
                   }
                 }}
               >
                 <option value="" disabled>Sélectionner...</option>
                 {selectionType === 'athlete' ? (
                     linkedAthletes.map(a => (
                         <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
                     ))
                 ) : (
                     groups.map(g => (
                         <option key={g.id} value={g.id}>{g.name}</option>
                     ))
                 )}
               </select>
           </div>
        </div>

        {/* Week Navigator & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            {/* Arrows & Date */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setCurrentDate(subDays(currentDate, 7))}
                    className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                
                <div className="text-center">
                    <span className="block text-xs text-gray-500 font-medium uppercase tracking-wider">Semaine du</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {format(weekStart, 'd MMM', { locale: fr })} - {format(weekEnd, 'd MMM yyyy', { locale: fr })}
                    </span>
                </div>

                <button 
                    onClick={() => setCurrentDate(addDays(currentDate, 7))}
                    className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Week Actions (Copy/Paste) */}
            <div className="flex items-center gap-2">
                <button
                    onClick={copyWeek}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    title="Copier cette semaine"
                >
                    <Copy size={16} />
                    <span className="hidden sm:inline">Copier</span>
                </button>
                
                {weekClipboard && (
                    <button
                        onClick={pasteWeek}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-sprint-primary rounded-lg shadow-sm hover:bg-sprint-primary/90 transition-colors animate-pulse"
                        title="Coller la semaine copiée"
                    >
                        <Clipboard size={16} />
                        <span className="hidden sm:inline">Coller</span>
                    </button>
                )}
            </div>
        </div>

      </header>

      {/* --- BODY (Daily List) --- */}
      <div className="space-y-3">
        {days.map(day => {
            const dayWorkouts = filteredWorkouts.filter(w => isSameDay(parseISO(w.date), day));
            return (
                <PlanningDayCard
                    key={day.toISOString()}
                    date={day}
                    workouts={dayWorkouts}
                    onAdd={() => handleAddWorkout(day)}
                    onEdit={(w) => setViewingWorkout(w)}
                    workoutTypeMap={workoutTypeMap}
                />
            );
        })}
      </div>

      {/* --- MODALS --- */}
      {isTemplateModalOpen && (
        <TemplateSelectionModal
          onClose={() => setTemplateModalOpen(false)}
          onCreateNew={handleCreateNewWorkout}
          onSelect={handleSelectTemplate}
        />
      )}
      
      {isWorkoutFormOpen && (
        <NewWorkoutForm
          userRole="coach"
          onCancel={() => setWorkoutFormOpen(false)}
          onSave={handleSaveWorkout}
          initialData={initialWorkoutData}
        />
      )}

      <WorkoutDetailsModal
        isOpen={!!viewingWorkout}
        onClose={() => setViewingWorkout(null)}
        workout={viewingWorkout}
        canEdit={true} 
      />
    </div>
  );
};
