import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, PlusCircle, Info } from 'lucide-react';
import { Workout } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WorkoutsCalendarProps {
  workouts: Workout[];
  onSelectWorkout: (workout: Workout) => void;
  onAddWorkout: (date: Date) => void;
  dailyData: Record<string, any>; // Gardé pour compatibilité mais non utilisé
}

export function WorkoutsCalendar({ workouts, onSelectWorkout, onAddWorkout }: WorkoutsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showLegend, setShowLegend] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: fr, weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { locale: fr, weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const workoutsByDate = workouts.reduce((acc, workout) => {
    if (workout.date) {
        const dateKey = format(new Date(workout.date), 'yyyy-MM-dd');
        if (!acc[dateKey]) { acc[dateKey] = []; }
        acc[dateKey].push(workout);
    }
    return acc;
  }, {} as Record<string, Workout[]>);

  const getWorkoutsForDay = (day: Date): Workout[] => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return workoutsByDate[dateKey] || [];
  };

  const tagEmojis: Record<string, string> = {
    vitesse_max: '⚡',
    lactique_piste: '🔥',
    lactique_cote: '⛰️',
    aerobie: '🫁',
    musculation: '💪',
    endurance_lactique: '🔥',
    technique_recup: '🧘'
  };

  const tagColors: Record<string, string> = {
    vitesse_max: 'bg-red-500',
    lactique_piste: 'bg-orange-500',
    lactique_cote: 'bg-yellow-500',
    aerobie: 'bg-blue-500',
    musculation: 'bg-purple-500',
    endurance_lactique: 'bg-orange-500',
    technique_recup: 'bg-green-500'
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());

  const MAX_VISIBLE_WORKOUTS = 3;

  return (
    <div className="space-y-4">
      {/* En-tête du calendrier */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium"
          >
            Aujourd'hui
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Mois suivant"
          >
            <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 w-full bg-gray-50 dark:bg-gray-900/50 border-b-2 border-gray-200 dark:border-gray-700">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Cases des jours */}
        <div className="grid grid-cols-7 w-full -ml-px">
          {calendarDays.map((day, idx) => {
            const dayWorkouts = getWorkoutsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const hasWorkout = dayWorkouts.length > 0;

            const visibleWorkouts = dayWorkouts.slice(0, MAX_VISIBLE_WORKOUTS);
            const hiddenWorkoutsCount = dayWorkouts.length - MAX_VISIBLE_WORKOUTS;

            return (
              <div
                key={idx}
                className={`flex flex-col border-b border-r border-gray-200 dark:border-gray-700 p-1.5 min-h-[100px] ${
                  !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/30' : ''
                } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
              >
                {/* Numéro du jour + bouton ajouter */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-semibold ${
                      isToday
                        ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                        : isCurrentMonth
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Bouton + uniquement aujourd'hui sans séance */}
                  {isToday && !hasWorkout && (
                    <button
                      onClick={() => onAddWorkout(day)}
                      className="p-1 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      aria-label="Ajouter une séance aujourd'hui"
                    >
                      <PlusCircle size={14} />
                    </button>
                  )}
                </div>

                {/* Liste des séances */}
                <div className="flex flex-col space-y-1 mt-1 flex-1">
                  {visibleWorkouts.map((workout) => (
                    <button
                      key={workout.id}
                      onClick={() => onSelectWorkout(workout)}
                      className={`w-full text-left px-1.5 py-1 rounded-lg text-[10px] font-medium text-white transition-all hover:opacity-90 hover:scale-105 whitespace-normal ${
                        tagColors[workout.tag_seance || ''] || 'bg-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{tagEmojis[workout.tag_seance || ''] || '📋'}</span>
                        <span className="truncate">
                          {workout.tag_seance && workout.tag_seance.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5 text-[8px] text-white/80">
                        {(workout.courses_json?.length || 0) > 0 && (
                          <span>🏃 {workout.courses_json?.length} courses</span>
                        )}
                        {(workout.exercises_json?.length || 0) > 0 && (
                          <span>💪 {workout.exercises_json?.length} exos</span>
                        )}
                        {workout.effort && (
                          <span>⚡{workout.effort}</span>
                        )}
                      </div>
                    </button>
                  ))}

                  {/* Affichage "+ X autres" si trop de séances */}
                  {hiddenWorkoutsCount > 0 && (
                    <button
                      onClick={() => onSelectWorkout(dayWorkouts[0])}
                      className="w-full text-center text-[10px] text-blue-600 dark:text-blue-400 font-medium pt-0.5 hover:underline"
                    >
                      +{hiddenWorkoutsCount} autres
                    </button>
                  )}

                  {/* Affichage discret "Repos" si pas de séance */}
                  {dayWorkouts.length === 0 && isCurrentMonth && (
                    <div className="text-center text-xs pt-4 text-gray-300 dark:text-gray-600">
                      Repos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton légende */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-3">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Légende des Séances</h4>
        <button 
          onClick={() => setShowLegend(!showLegend)} 
          className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Info size={20} aria-label={showLegend ? "Cacher la légende" : "Afficher la légende"} />
        </button>
      </div>

      {/* Légende dépliable */}
      {showLegend && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 animate-fadeIn">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">⚡ Vitesse Max</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">🔥 Lactique Piste</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">⛰️ Lactique Côte</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">🫁 Aérobie</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">💪 Musculation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">🧘 Technique/Récup</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}