import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Copy, Clipboard, Plus, Edit2 } from 'lucide-react';
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
import { RhythmBar } from './RhythmBar';
import { PhaseCreationModal } from './PhaseCreationModal';
import { SmartPlanningModal, SmartPlanningPayload } from './SmartPlanningModal';
import { useTrainingPhases } from '../../hooks/useTrainingPhases';
import { Workout } from '../../types';
import { PlanningPhase } from '../../types/planning';

type ActiveFilter = {
  type: 'group' | 'athlete';
  id: string;
  name: string;
};

type SelectionType = 'group' | 'athlete';

export const CoachPlanning: React.FC = () => {
  const { user } = useAuth();
  // Pass the active filter to useWorkouts to fetch relevant data
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null);
  const selectionForHook = useMemo(() => {
    if (!activeFilter) return undefined;
    return { type: activeFilter.type, id: activeFilter.id };
  }, [activeFilter]);

  const { workouts, planWorkout, batchPlanWorkouts } = useWorkouts(selectionForHook);
  const { 
    phases, 
    createPhase, 
    updatePhase,
    deletePhase, 
    getPhaseForDate 
  } = useTrainingPhases(selectionForHook || null);
  
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
  const [selectionType, setSelectionType] = useState<SelectionType>('group'); // Default to group

  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isWorkoutFormOpen, setWorkoutFormOpen] = useState(false);
  const [isSmartPlanningOpen, setSmartPlanningOpen] = useState(false);
  const [isPhaseModalOpen, setPhaseModalOpen] = useState(false);
  const [phaseStartDate, setPhaseStartDate] = useState<Date>(new Date());
  const [editingPhase, setEditingPhase] = useState<PlanningPhase | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [initialWorkoutData, setInitialWorkoutData] = useState<any>(null);
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);
  
  // Clipboard state for Copy/Paste Week
  const [weekClipboard, setWeekClipboard] = useState<Workout[] | null>(null);

  useEffect(() => {
    // Logic to select the first available item if nothing is selected
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

  // Phase for the current week (based on Monday)
  const currentWeekPhase = getPhaseForDate(weekStart);

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
    handleCreateNewWorkout();
  };

  const handleCreateNewWorkout = () => {
    setTemplateModalOpen(false);
    setInitialWorkoutData(null);
    setSmartPlanningOpen(true);
  };

  const handleSelectTemplate = (template: WorkoutTemplate) => {
    setTemplateModalOpen(false);
    setInitialWorkoutData({
      title: template.template_name,
      blocks: template.workout_data.blocs,
      notes: template.description || '',
      tag_seance: template.workout_data.tag_seance, // Pass tag_seance if available in template
    });
    setSmartPlanningOpen(true);
  };

  const handleSaveSmartPlanning = async (payload: SmartPlanningPayload) => {
    if (!selectedDate || !activeFilter) return;

    const planningPayload: any = {
      title: payload.title,
      type: 'guidé',
      tag_seance: payload.tag_seance,
      notes: payload.notes,
      planned_data: { blocs: payload.blocs },
      date: format(payload.date, 'yyyy-MM-dd'),
    };

    if (activeFilter.type === 'group') {
      planningPayload.assigned_to_group_id = activeFilter.id;
    } else {
      planningPayload.assigned_to_user_id = activeFilter.id;
    }

    try {
        await planWorkout(planningPayload);
        toast.success("Séance planifiée avec succès");
        setSmartPlanningOpen(false);
    } catch (e) {
        toast.error("Erreur lors de la planification");
        console.error(e);
    }
  };

  // Kept for backward compatibility if needed, but not used in new flow
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
        
        {/* Master Selector (Group / Athlete) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-gray-700/50">
           <select
             className="w-full h-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 font-semibold text-gray-900 dark:text-white outline-none cursor-pointer border-r-[12px] border-transparent"
             value={activeFilter ? `${activeFilter.type}:${activeFilter.id}` : ''}
             onChange={(e) => {
               const value = e.target.value;
               if (!value) return;

               const [type, id] = value.split(':');
               
               if (type === 'athlete') {
                 const a = linkedAthletes.find(l => l.id === id);
                 if (a) {
                   setSelectionType('athlete');
                   setActiveFilter({ type: 'athlete', id: a.id, name: `${a.first_name} ${a.last_name}`});
                 }
               } else if (type === 'group') {
                 const g = groups.find(gr => gr.id === id);
                 if (g) {
                   setSelectionType('group');
                   setActiveFilter({ type: 'group', id: g.id, name: g.name });
                 }
               }
             }}
           >
             <option value="" disabled>Sélectionner un planning...</option>
             
             <optgroup label="Mes Groupes">
               {groups.map(g => (
                 <option key={g.id} value={`group:${g.id}`}>
                   👥 {g.name}
                 </option>
               ))}
             </optgroup>

             <optgroup label="Mes Athlètes">
               {linkedAthletes.map(a => (
                 <option key={a.id} value={`athlete:${a.id}`}>
                   👤 {a.first_name} {a.last_name}
                 </option>
               ))}
             </optgroup>
           </select>
        </div>

        {/* Rhythm Bar (Timeline) */}
        {activeFilter && (
            <RhythmBar 
                currentDate={currentDate}
                phases={phases}
                onAddPhase={(date) => {
                    setPhaseStartDate(date);
                    setEditingPhase(null);
                    setPhaseModalOpen(true);
                }}
                onDeletePhase={deletePhase}
                contextType={activeFilter.type}
            />
        )}

        {/* Week Navigator & Actions */}
        <div className="flex flex-col gap-4">
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

          {/* Explicit Phase Indicator */}
          <div className="flex justify-center -mt-2">
            {currentWeekPhase ? (
              <button 
                onClick={() => {
                  setPhaseStartDate(parseISO(currentWeekPhase.start_date));
                  setEditingPhase(currentWeekPhase);
                  setPhaseModalOpen(true);
                }}
                className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-opacity-20 backdrop-blur-sm border border-transparent hover:border-current transition-all cursor-pointer"
                style={{ 
                  backgroundColor: `${currentWeekPhase.color_hex}20`,
                  color: currentWeekPhase.color_hex,
                  borderColor: `${currentWeekPhase.color_hex}40`
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentWeekPhase.color_hex }}
                />
                <span className="text-sm font-bold">
                  {currentWeekPhase.name}
                </span>
                <Edit2 size={12} className="opacity-50 group-hover:opacity-100 transition-opacity ml-1" />
              </button>
            ) : (
              <button 
                onClick={() => {
                  setPhaseStartDate(weekStart);
                  setEditingPhase(null);
                  setPhaseModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:text-sprint-primary hover:border-sprint-primary transition-colors text-sm font-medium"
              >
                <Plus size={14} />
                Définir le cycle / phase
              </button>
            )}
          </div>
        </div>

      </header>

      {/* --- BODY (Daily List) --- */}
      <div className="space-y-3">
        {days.map(day => {
            const dayWorkouts = filteredWorkouts.filter(w => isSameDay(parseISO(w.date), day));
            const currentPhase = getPhaseForDate(day);
            
            return (
                <PlanningDayCard
                    key={day.toISOString()}
                    date={day}
                    workouts={dayWorkouts}
                    onAdd={() => handleAddWorkout(day)}
                    onEdit={(w) => setViewingWorkout(w)}
                    workoutTypeMap={workoutTypeMap}
                    currentPhase={currentPhase || undefined}
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

      {isSmartPlanningOpen && selectedDate && (
        <SmartPlanningModal
          isOpen={isSmartPlanningOpen}
          onClose={() => setSmartPlanningOpen(false)}
          onSave={handleSaveSmartPlanning}
          selectedDate={selectedDate}
          initialData={initialWorkoutData}
        />
      )}

      {isPhaseModalOpen && activeFilter && user && (
        <PhaseCreationModal
            isOpen={isPhaseModalOpen}
            onClose={() => setPhaseModalOpen(false)}
            onSave={createPhase}
            onUpdate={updatePhase}
            defaultStartDate={phaseStartDate}
            context={activeFilter}
            userRole="coach"
            userId={user.id}
            editingPhase={editingPhase}
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
