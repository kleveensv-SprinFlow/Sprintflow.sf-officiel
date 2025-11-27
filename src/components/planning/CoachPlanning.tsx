import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Copy, Clipboard, Users, User, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
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

// Components for clean header
const UndoToast = ({ onUndo, closeToast }: { onUndo: () => void, closeToast?: () => void }) => (
  <div className="flex items-center justify-between gap-4">
    <span>Semaine collée !</span>
    <button
      onClick={() => { onUndo(); if(closeToast) closeToast(); }}
      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-bold flex items-center gap-1"
    >
      <RotateCcw size={14} /> Annuler
    </button>
  </div>
);

type ActiveFilter = {
  type: 'group' | 'athlete';
  id: string;
  name: string;
};

type SelectionType = 'group' | 'athlete';

export const CoachPlanning: React.FC = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null);
  const selectionForHook = useMemo(() => {
    if (!activeFilter) return undefined;
    return { type: activeFilter.type, id: activeFilter.id };
  }, [activeFilter]);

  const { workouts, planWorkout, batchPlanWorkouts, deleteWorkout } = useWorkouts(selectionForHook);
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
  const [selectionType, setSelectionType] = useState<SelectionType>('athlete');

  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isWorkoutFormOpen, setWorkoutFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [initialWorkoutData, setInitialWorkoutData] = useState<any>(null);
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);
  
  const [weekClipboard, setWeekClipboard] = useState<Workout[] | null>(null);

  // Auto-select first item
  useEffect(() => {
    if (!activeFilter) {
      if (selectionType === 'athlete' && !loadingAthletes && linkedAthletes.length > 0) {
        const firstAthlete = linkedAthletes[0];
        setActiveFilter({ type: 'athlete', id: firstAthlete.id, name: `${firstAthlete.first_name} ${firstAthlete.last_name}` });
      } else if (selectionType === 'group' && !loadingGroups && groups.length > 0) {
        const firstGroup = groups[0];
        setActiveFilter({ type: 'group', id: firstGroup.id, name: firstGroup.name });
      }
    }
  }, [activeFilter, selectionType, loadingAthletes, linkedAthletes, loadingGroups, groups]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const filteredWorkouts = useMemo(() => workouts, [workouts]);

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
      blocs: template.workout_data.blocs,
      type: template.workout_data.type || 'guidé',
      tag_seance: template.workout_data.tag_seance,
      notes: template.workout_data.notes,
      duration_minutes: template.workout_data.duration_minutes || (template.workout_data.planned_data as any)?.duration,
      planned_data: { rpe_target: (template.workout_data.planned_data as any)?.rpe_target }
    });
    setWorkoutFormOpen(true);
  };

  const handleSaveWorkout = async (payload: { blocs: any[]; type: 'guidé' | 'manuscrit'; tag_seance: string; notes?: string; duration?: number; rpe_target?: number }) => {
    if (!selectedDate || !activeFilter) return;

    const workoutTypeName = workoutTypeMap.get(payload.tag_seance)?.name || 'Séance';

    const planningPayload: any = {
      title: workoutTypeName,
      type: payload.type,
      tag_seance: payload.tag_seance,
      notes: payload.notes,
      planned_data: {
          blocs: payload.blocs,
          duration: payload.duration,
          rpe_target: payload.rpe_target
      },
      duration_minutes: payload.duration, // If we add column later, good to have.
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

      const sourceDate = parseISO(weekClipboard[0].date);
      const sourceWeekStart = startOfWeek(sourceDate, { weekStartsOn: 1 });
      const targetWeekStart = weekStart;

      const newPlannings = weekClipboard.map(w => {
          const originalDate = parseISO(w.date);
          const dayOffset = differenceInCalendarDays(originalDate, sourceWeekStart);
          const newDate = addDays(targetWeekStart, dayOffset);
          
          return {
              date: format(newDate, 'yyyy-MM-dd'),
              type: w.type,
              tag_seance: w.tag_seance,
              notes: w.notes,
              planned_data: w.planned_data || w.workout_data, 
              assigned_to_user_id: activeFilter.type === 'athlete' ? activeFilter.id : undefined,
              assigned_to_group_id: activeFilter.type === 'group' ? activeFilter.id : undefined,
          };
      });

      // Implement Undo Logic
      let createdWorkouts: Workout[] = [];

      try {
        const result = await batchPlanWorkouts(newPlannings);
        if (result) createdWorkouts = result as Workout[];

        // Show Toast with Undo
        toast(<UndoToast onUndo={() => handleUndoPaste(createdWorkouts)} />, { autoClose: 5000 });
        setWeekClipboard(null);
      } catch (e) {
          console.error(e);
          toast.error("Erreur lors du collage de la semaine.");
      }
  };

  const handleUndoPaste = async (createdWorkouts: Workout[]) => {
      try {
          // Sequentially delete (could be batched if API supported it)
          for (const w of createdWorkouts) {
              await deleteWorkout(w.id);
          }
          toast.info("Collage annulé.");
      } catch (e) {
          console.error("Undo failed", e);
          toast.error("Erreur lors de l'annulation.");
      }
  };

  return (
    <div className="pb-24 pt-2 px-2 max-w-4xl mx-auto min-h-screen">
      
      {/* --- HEADER --- */}
      <header className="mb-6 space-y-4">
        
        {/* Unified Control Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-2 flex flex-col md:flex-row gap-3">

            {/* Left: Context Selector */}
            <div className="flex-1 flex gap-2">
                 {/* Type Switcher (Icon Only on Mobile) */}
                 <div className="flex bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1 shrink-0">
                    <button
                        onClick={() => { setSelectionType('athlete'); setActiveFilter(null); }}
                        className={`p-2 rounded-lg transition-all ${selectionType === 'athlete' ? 'bg-white dark:bg-gray-600 shadow text-sprint-primary' : 'text-gray-400'}`}
                        title="Athlètes"
                    >
                        <User size={20} />
                    </button>
                    <button
                        onClick={() => { setSelectionType('group'); setActiveFilter(null); }}
                        className={`p-2 rounded-lg transition-all ${selectionType === 'group' ? 'bg-white dark:bg-gray-600 shadow text-sprint-primary' : 'text-gray-400'}`}
                        title="Groupes"
                    >
                        <Users size={20} />
                    </button>
                 </div>

                 {/* Dropdown */}
                 <div className="flex-1 relative">
                    <select
                        className="w-full h-full pl-3 pr-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-sprint-primary/20 appearance-none"
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
                            linkedAthletes.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)
                        ) : (
                            groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)
                        )}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <ChevronRight size={16} className="rotate-90" />
                    </div>
                 </div>
            </div>

            {/* Right: Week Nav & Actions */}
            <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-gray-100 dark:border-gray-700 pt-2 md:pt-0">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-1">
                    <button onClick={() => setCurrentDate(subDays(currentDate, 7))} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"><ChevronLeft size={18}/></button>
                    <div className="px-2 text-sm font-bold w-24 text-center">{format(weekStart, 'd MMM', { locale: fr })}</div>
                    <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"><ChevronRight size={18}/></button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={copyWeek}
                        className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Copier la semaine"
                    >
                        <Copy size={20} />
                    </button>
                    {weekClipboard && (
                         <button
                            onClick={pasteWeek}
                            className="p-2.5 bg-sprint-primary text-white rounded-xl shadow-lg shadow-sprint-primary/30 hover:bg-sprint-primary/90 transition-transform active:scale-95 animate-pulse"
                            title="Coller la semaine"
                        >
                            <Clipboard size={20} />
                        </button>
                    )}
                </div>
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
