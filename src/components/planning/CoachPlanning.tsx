import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, User, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
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

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: 'all', id: null, name: 'Tous les athlètes' });

  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isWorkoutFormOpen, setWorkoutFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [initialWorkoutData, setInitialWorkoutData] = useState<any>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
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

  const handleSaveWorkout = async (payload: { title: string; blocs: any[] }) => {
    if (!selectedDate) return;

    const planningPayload: any = {
      title: payload.title,
      planned_data: { blocs: payload.blocs },
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
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
                    setActiveFilter({ type, id: id === 'null' ? null : id, name });
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
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></button>
            <h2 className="text-lg font-semibold w-32 text-center">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 bg-white dark:bg-gray-800 p-2 rounded-lg shadow">
        {weekDays.map(day => <div key={day} className="text-center font-bold text-sm">{day}</div>)}

        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          const workoutsForDay = filteredWorkouts.filter(w => {
            const dateToCompare = w.status === 'planned' ? w.scheduled_date! : w.date;
            return isSameDay(parseISO(dateToCompare), day);
          });

          return (
            <div
              key={day.toString()}
              className={`h-32 border rounded-lg p-1 flex flex-col ${isCurrentMonth ? '' : 'bg-gray-100 dark:bg-gray-700 opacity-50'} ${isToday ? 'border-primary-500' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <span className={`font-semibold ${isToday ? 'text-primary-500' : ''}`}>{format(day, 'd')}</span>
              <div className="flex-grow overflow-y-auto text-xs space-y-1 mt-1">
                {workoutsForDay.map(w => {
                  const isPlanned = w.status === 'planned';
                  return (
                    <div
                      key={w.id}
                      className={`p-1 rounded-md truncate ${isPlanned ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}`}
                      title={w.title}
                    >
                      {w.title}
                      {!isPlanned && w.rpe && (
                        <span className="font-bold ml-1">(RPE: {w.rpe})</span>
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
