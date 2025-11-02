import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, User, Filter, Plus } from 'lucide-react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, addDays, subDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useWorkouts } from '../../hooks/useWorkouts';
import { useGroups } from '../../hooks/useGroups';
import { useCoachLinks } from '../../hooks/useCoachLinks';
import useAuth from '../../hooks/useAuth';
import { WorkoutTemplate } from '../../hooks/useWorkoutTemplates';

import { TemplateSelectionModal } from '../workouts/TemplateSelectionModal';
import { NewWorkoutForm } from '../workouts/NewWorkoutForm';
import { Workout } from '../../types';

type ActiveFilter = {
  type: 'all' | 'group' | 'athlete';
  id: string | null;
  name: string;
};

export const CoachPlanning: React.FC = () => {
  const { user } = useAuth();
  const { workouts, planWorkout, loading: loadingWorkouts } = useWorkouts();
  const { groups, loading: loadingGroups } = useGroups();
  const { linkedAthletes, loading: loadingAthletes } = useCoachLinks(user?.id);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: 'all', id: null, name: 'Tous les athlètes' });

  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isWorkoutFormOpen, setWorkoutFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [initialWorkoutData, setInitialWorkoutData] = useState<any>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const filteredWorkouts = useMemo(() => {
    if (activeFilter.type === 'all') {
      return workouts.filter(w => w.coach_id === user?.id && w.status === 'planned');
    }
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
  }, [workouts, activeFilter, user?.id]);

  const handleDateClick = (date: Date) => {
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

  const handleSaveWorkout = async (payload: { title: string; blocs: any[]; type: 'guidé' | 'manuscrit'; tag_seance: string; notes?: string; }) => {
    if (!selectedDate) return;

    const planningPayload: any = {
      title: payload.title,
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
    } else {
        alert("Veuillez sélectionner un groupe ou un athlète spécifique pour assigner une séance.");
        return;
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
          onCancel={() => setWorkoutFormOpen(false)}
          onSave={handleSaveWorkout}
          initialData={initialWorkoutData}
        />
      )}

      <h1 className="text-2xl font-bold">Calendrier de Planification</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center gap-2">
            <Filter size={20} />
            <select
                className="p-2 border rounded-lg dark:bg-gray-700"
                value={`${activeFilter.type}:${activeFilter.id || 'null'}`}
                onChange={(e) => {
                    const [type, id] = e.target.value.split(':');
                    const name = e.target.options[e.target.selectedIndex].text;
                    setActiveFilter({ type: type as 'all' | 'group' | 'athlete', id: id === 'null' ? null : id, name });
                }}
            >
                <option value="all:null">Tous les athlètes</option>
                <optgroup label="Groupes">
                    {groups.map(g => <option key={g.id} value={`group:${g.id}`}>{g.name}</option>)}
                </optgroup>
                <optgroup label="Athlètes">
                    {linkedAthletes.map(a => <option key={a.id} value={`athlete:${a.id}`}>{a.first_name} {a.last_name}</option>)}
                </optgroup>
            </select>
        </div>
        <div className="flex items-center gap-4">
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
            const dateToCompare = w.status === 'planned' ? w.date : w.date;
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
              
              <div className="flex-grow overflow-y-auto text-sm space-y-2">
                {workoutsForDay.map(w => {
                  const isPlanned = w.status === 'planned';
                  return (
                    <div
                      key={w.id}
                      className={`p-2 rounded-lg shadow-sm truncate ${isPlanned ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}`}
                      title={w.title}
                    >
                      <p className="font-semibold">{w.title}</p>
                      <p className="text-xs opacity-80">{w.type === 'guidé' ? 'Séance Guidée' : 'Manuscrit'}</p>
                      {!isPlanned && w.rpe && (
                        <p className="font-bold text-xs mt-1">RPE: {w.rpe}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={() => handleDateClick(day)}
                className="absolute bottom-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-colors"
                aria-label="Ajouter une séance"
              >
                <Plus size={20} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
