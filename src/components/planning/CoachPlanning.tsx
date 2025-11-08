import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, addDays, subDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useWorkouts } from '../../hooks/useWorkouts';
import { useGroups } from '../../hooks/useGroups';
import { useCoachLinks } from '../../hooks/useCoachLinks';
import useAuth from '../../hooks/useAuth';
import { WorkoutTemplate } from '../../hooks/useWorkoutTemplates';
import { useWorkoutTypes } from '../../hooks/useWorkoutTypes';

import { TemplateSelectionModal } from '../workouts/TemplateSelectionModal';
import { NewWorkoutForm } from '../workouts/NewWorkoutForm';
import { WorkoutDetailsModal } from '../workouts/WorkoutDetailsModal';
import { Workout } from '../../types';

type ActiveFilter = {
  type: 'group' | 'athlete';
  id: string;
  name: string;
};

type SelectionType = 'group' | 'athlete';

export const CoachPlanning: React.FC = () => {
  const { user } = useAuth();
  const { workouts, planWorkout } = useWorkouts();
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
  const [selectionType, setSelectionType] = useState<SelectionType>('group');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null);

  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isWorkoutFormOpen, setWorkoutFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [initialWorkoutData, setInitialWorkoutData] = useState<any>(null);
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    // Set default filter to the first group when data is available
    if (selectionType === 'group' && !loadingGroups && groups.length > 0) {
      if (!activeFilter || activeFilter.type !== 'group') {
        setActiveFilter({ type: 'group', id: groups[0].id, name: groups[0].name });
      }
    // Set default filter to the first athlete when data is available
    } else if (selectionType === 'athlete' && !loadingAthletes && linkedAthletes.length > 0) {
      if (!activeFilter || activeFilter.type !== 'athlete') {
        const athlete = linkedAthletes[0];
        setActiveFilter({ type: 'athlete', id: athlete.id, name: `${athlete.first_name} ${athlete.last_name}` });
      }
    // If a type is selected but its list is empty, clear the filter
    } else if ((selectionType === 'group' && !loadingGroups && groups.length === 0) || (selectionType === 'athlete' && !loadingAthletes && linkedAthletes.length === 0)) {
        setActiveFilter(null);
    }
  }, [selectionType, groups, linkedAthletes, loadingGroups, loadingAthletes, activeFilter]);


  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const filteredWorkouts = useMemo(() => {
    if (!activeFilter) return [];
    
    if (activeFilter.type === 'group') {
      return workouts.filter(w => w.assigned_to_group_id === activeFilter.id && w.status === 'planned');
    }
    if (activeFilter.type === 'athlete') {
      return workouts.filter(w =>
        (w.assigned_to_user_id === activeFilter.id && w.status === 'planned') ||
        (w.user_id === activeFilter.id && w.status === 'completed')
      );
    }
    return [];
  }, [workouts, activeFilter]);

  const handleDateClick = (date: Date) => {
    if (!activeFilter) {
      alert("Veuillez d'abord sélectionner un groupe ou un athlète.");
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
    if (!selectedDate || !activeFilter) {
        alert("Veuillez sélectionner un groupe ou un athlète pour assigner la séance.");
        return;
    }

    const workoutTypeName = workoutTypeMap.get(payload.tag_seance)?.name || 'Séance';

    const planningPayload: any = {
      title: workoutTypeName,
      type: payload.type,
      tag_seance: payload.tag_seance,
      notes: payload.notes,
      planned_data: { blocs: payload.blocs },
      date: format(selectedDate, 'yyyy-MM-dd'),
    };

    if (activeFilter.type === 'group' && activeFilter.id) {
      planningPayload.assigned_to_group_id = activeFilter.id;
    } else if (activeFilter.type === 'athlete' && activeFilter.id) {
      planningPayload.assigned_to_user_id = activeFilter.id;
    }

    await planWorkout(planningPayload);
    setWorkoutFormOpen(false);
  };

  return (
    <div className="p-4 space-y-4">
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

      <h1 className="text-2xl font-bold">Calendrier de Planification</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button
                    onClick={() => setSelectionType('group')}
                    className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${
                        selectionType === 'group' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'
                    }`}
                >
                    Groupes
                </button>
                <button
                    onClick={() => setSelectionType('athlete')}
                    className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${
                        selectionType === 'athlete' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300'
                    }`}
                >
                    Athlètes
                </button>
            </div>
            
            {selectionType === 'group' && (
                <select
                    className="p-2 border rounded-lg dark:bg-gray-700 w-full sm:w-auto"
                    value={activeFilter?.id || ''}
                    onChange={(e) => {
                        const id = e.target.value;
                        const group = groups.find(g => g.id === id);
                        if(group) setActiveFilter({ type: 'group', id, name: group.name });
                    }}
                    disabled={loadingGroups || groups.length === 0}
                >
                    {loadingGroups ? (
                        <option>Chargement...</option>
                    ) : groups.length > 0 ? (
                        groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)
                    ) : (
                        <option>Aucun groupe</option>
                    )}
                </select>
            )}

            {selectionType === 'athlete' && (
                <select
                    className="p-2 border rounded-lg dark:bg-gray-700 w-full sm:w-auto"
                    value={activeFilter?.id || ''}
                    onChange={(e) => {
                        const id = e.target.value;
                        const athlete = linkedAthletes.find(a => a.id === id);
                        if(athlete) setActiveFilter({ type: 'athlete', id, name: `${athlete.first_name} ${athlete.last_name}` });
                    }}
                    disabled={loadingAthletes || linkedAthletes.length === 0}
                >
                     {loadingAthletes ? (
                        <option>Chargement...</option>
                    ) : linkedAthletes.length > 0 ? (
                        linkedAthletes.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)
                    ) : (
                        <option>Aucun athlète</option>
                    )}
                </select>
            )}
        </div>
        <div className="flex items-center gap-4 self-center">
          <button onClick={() => setCurrentDate(subDays(currentDate, 7))}><ChevronLeft /></button>
          <h2 className="text-lg font-semibold w-48 text-center">
            {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: fr })} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: fr })}
          </h2>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))}><ChevronRight /></button>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-7 gap-2 text-center font-bold mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {days.map((day, index) => {
          const isToday = isSameDay(day, new Date());

          const workoutsForDay = filteredWorkouts.filter(w => {
            const dateToCompare = w.date; 
            return dateToCompare ? isSameDay(parseISO(dateToCompare), day) : false;
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
                      onClick={() => setViewingWorkout(w)}
                      className="p-2 rounded-lg shadow-sm truncate bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      style={{
                        borderLeft: `4px solid ${workoutColor}`
                      }}
                      title={workoutName}
                    >
                      <p className="font-semibold">{workoutName}</p>
                      <p className="text-xs opacity-80">{w.type === 'guidé' ? 'Guidée' : 'Manuscrit'}</p>
                      {w.status === 'completed' && w.rpe && (
                        <p className="font-bold text-xs mt-1">RPE: {w.rpe}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={() => handleDateClick(day)}
                className={`absolute bottom-2 right-2 flex items-center justify-center w-8 h-8 rounded-full text-white shadow-lg transition-colors ${activeFilter ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-400 cursor-not-allowed'}`}
                aria-label="Ajouter une séance"
                disabled={!activeFilter}
              >
                <Plus size={20} />
              </button>
            </div>
          );
        })}
      </div>

      <WorkoutDetailsModal
        isOpen={!!viewingWorkout}
        onClose={() => setViewingWorkout(null)}
        workout={viewingWorkout}
      />
    </div>
  );
};