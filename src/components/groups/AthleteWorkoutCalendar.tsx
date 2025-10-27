import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Dumbbell, Target, X, Play } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatTime, formatDistance } from '../../utils/formatters';

interface AthleteWorkout {
  id: string;
  date: string;
  runs: Array<{
    id: string;
    distance: number;
    time: number;
    series?: number;
    reps?: number;
    rest_time?: number;
    timing_method?: string;
    wind_speed?: number;
    is_hill?: boolean;
    hill_location?: string;
  }>;
  jumps?: Array<{
    id: string;
    discipline: string;
    distance: number;
    distance_method?: string;
    wind_speed?: number;
  }>;
  throws?: Array<{
    id: string;
    discipline: string;
    distance: number;
    distance_method?: string;
    wind_speed?: number;
  }>;
  exercises: Array<{
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    rest_time?: number;
  }>;
  notes?: string;
}

interface AthleteWorkoutCalendarProps {
  workouts: AthleteWorkout[];
  athleteName: string;
}

export const AthleteWorkoutCalendar: React.FC<AthleteWorkoutCalendarProps> = ({ workouts, athleteName }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<AthleteWorkout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getWorkoutsForDay = (day: Date) => {
    return workouts.filter(workout => isSameDay(new Date(workout.date), day));
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getDayClasses = (day: Date) => {
    const dayWorkouts = getWorkoutsForDay(day);
    const hasWorkouts = dayWorkouts.length > 0;
    const isCurrentDay = isToday(day);
    
    let classes = 'min-h-[80px] sm:min-h-[100px] p-2 border border-gray-200 dark:border-gray-600 transition-all duration-200 card-3d ';
    
    if (isCurrentDay) {
      classes += 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-600 ';
    } else if (hasWorkouts) {
      classes += 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer ';
    } else {
      classes += 'bg-white dark:bg-gray-800 ';
    }
    
    return classes;
  };

  const handleDayClick = (day: Date) => {
    const dayWorkouts = getWorkoutsForDay(day);
    if (dayWorkouts.length > 0) {
      setSelectedWorkout(dayWorkouts[0]);
    }
  };

  if (workouts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700 card-3d">
        <Dumbbell className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun entraînement</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {athleteName} n'a pas encore enregistré d'entraînements.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Header du calendrier */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-4 card-3d">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation flex-shrink-0 button-3d"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="text-center flex-1 px-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Entraînements de {athleteName}
            </p>
          </div>
          
          <button
            onClick={nextMonth}
            className="p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation flex-shrink-0 button-3d"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 text-center">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="p-1 sm:p-2 text-xs font-medium text-gray-600 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {monthDays.map((day) => {
            const dayWorkouts = getWorkoutsForDay(day);
            const hasWorkouts = dayWorkouts.length > 0;
            
            return (
              <div
                key={day.toISOString()}
                className={getDayClasses(day)}
                onClick={hasWorkouts ? () => handleDayClick(day) : undefined}
                style={{ cursor: hasWorkouts ? 'pointer' : 'default' }}
              >
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className={`text-xs font-medium ${
                    isToday(day) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {hasWorkouts && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
                
                {hasWorkouts && (
                  <div className="space-y-1 px-1">
                    {dayWorkouts.map((workout) => (
                      <div key={workout.id} className="text-xs leading-relaxed">
                        {workout.runs.length > 0 && (
                          <div className="text-primary-600 dark:text-primary-400 font-medium text-xs bg-white/80 dark:bg-gray-800/80 px-1 py-0.5 rounded mb-1">
                            🏃 {workout.runs.length}
                          </div>
                        )}
                        {workout.jumps && workout.jumps.length > 0 && (
                          <div className="text-green-600 dark:text-green-400 font-medium text-xs bg-white/80 dark:bg-gray-800/80 px-1 py-0.5 rounded mb-1">
                            🦘 {workout.jumps.length}
                          </div>
                        )}
                        {workout.throws && workout.throws.length > 0 && (
                          <div className="text-purple-600 dark:text-purple-400 font-medium text-xs bg-white/80 dark:bg-gray-800/80 px-1 py-0.5 rounded mb-1">
                            🎯 {workout.throws.length}
                          </div>
                        )}
                        {workout.exercises.length > 0 && (
                          <div className="text-secondary-600 dark:text-secondary-400 font-medium text-xs bg-white/80 dark:bg-gray-800/80 px-1 py-0.5 rounded">
                            💪 {workout.exercises.length}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Détails de l'entraînement sélectionné */}
      {selectedWorkout && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 mt-4 card-3d-deep">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white break-words">
                Entraînement du {format(new Date(selectedWorkout.date), 'd MMMM yyyy', { locale: fr })}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(new Date(selectedWorkout.date), 'EEEE', { locale: fr })} - {athleteName}
              </p>
            </div>
            <button
              onClick={() => setSelectedWorkout(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation self-end sm:self-auto flex-shrink-0 button-3d"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Résumé de la séance */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4 card-3d">
            <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center">
              <Play className="h-4 w-4 mr-2" />
              Résumé de la séance
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white dark:bg-gray-700 p-2 rounded-lg">
                <div className="font-bold text-primary-600 dark:text-primary-400 text-lg">{selectedWorkout.runs.length}</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">Course{selectedWorkout.runs.length > 1 ? 's' : ''}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-2 rounded-lg">
                <div className="font-bold text-green-600 dark:text-green-400 text-lg">{selectedWorkout.jumps?.length || 0}</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">Saut{(selectedWorkout.jumps?.length || 0) > 1 ? 's' : ''}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-2 rounded-lg">
                <div className="font-bold text-purple-600 dark:text-purple-400 text-lg">{selectedWorkout.throws?.length || 0}</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">Lancer{(selectedWorkout.throws?.length || 0) > 1 ? 's' : ''}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-2 rounded-lg">
                <div className="font-bold text-secondary-600 dark:text-secondary-400 text-lg">{selectedWorkout.exercises.length}</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">Exercice{selectedWorkout.exercises.length > 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Courses */}
            {selectedWorkout.runs.length > 0 && (
              <div className="overflow-hidden">
                <h4 className="text-base font-medium text-primary-500 mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Courses ({selectedWorkout.runs.length})
                </h4>
                <div className="space-y-3">
                  {selectedWorkout.runs.map((run, index) => (
                    <div key={run.id} className="bg-primary-50 dark:bg-primary-900/20 p-3 sm:p-4 rounded-lg border border-primary-200 dark:border-primary-800 card-3d">
                      <div className="flex flex-col space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Course #{index + 1}
                          </span>
                          {(run as any).is_hill && <span className="text-orange-500 text-xs">⛰️ Côte</span>}
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-primary-500" />
                              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                {formatDistance(run.distance)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-primary-500" />
                              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                {formatTime(run.time)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Structure de l'entraînement */}
                      {run.series && run.series > 1 && (
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border mb-3">
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            📊 <strong>{run.series} série{run.series > 1 ? 's' : ''}</strong> × <strong>{run.reps || 1} rép.</strong>
                            {run.rest_time && (
                              <span className="text-blue-600 dark:text-blue-400 ml-2">
                                (repos: {run.rest_time}s)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Métadonnées */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                            {(run as any).timing_method === 'automatic' ? '⏱️ Chrono auto' : '⏱️ Chrono manuel'}
                          </span>
                          {(run as any).wind_speed !== undefined && (
                            <span className="bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded text-xs">
                              💨 {(run as any).wind_speed > 0 ? '+' : ''}{(run as any).wind_speed.toFixed(1)} m/s
                            </span>
                          )}
                          {(run as any).shoe_type && (
                            <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-xs">
                              👟 {(run as any).shoe_type === 'spikes' ? 'Pointes' : 'Baskets'}
                            </span>
                          )}
                        </div>
                        
                        {(run as any).hill_location && (
                          <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
                            <div className="text-sm text-orange-700 dark:text-orange-300 break-words">
                              📍 <strong>Lieu :</strong> {(run as any).hill_location}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sauts */}
            {selectedWorkout.jumps && selectedWorkout.jumps.length > 0 && (
              <div className="overflow-hidden">
                <h4 className="text-base font-medium text-green-500 mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Sauts ({selectedWorkout.jumps.length})
                </h4>
                <div className="space-y-3">
                  {selectedWorkout.jumps.map((jump, index) => (
                    <div key={jump.id} className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-800 card-3d">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Saut #{index + 1}
                          </span>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <div className="text-green-700 dark:text-green-300 font-medium text-sm break-words">
                            {jump.discipline}
                          </div>
                          <div className="text-green-600 dark:text-green-400 font-bold text-lg">
                            {jump.distance.toFixed(2)}m
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {jump.distance_method && (
                            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                              📏 {jump.distance_method === 'theodolite' ? 'Théodolite' : 'Décamètre'}
                            </span>
                          )}
                          {jump.wind_speed !== undefined && (
                            <span className="bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded text-xs">
                              💨 {jump.wind_speed > 0 ? '+' : ''}{jump.wind_speed.toFixed(1)} m/s
                            </span>
                          )}
                          {(jump as any).shoe_type && (
                            <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-xs">
                              👟 {(jump as any).shoe_type === 'spikes' ? 'Pointes' : 'Baskets'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lancers */}
            {selectedWorkout.throws && selectedWorkout.throws.length > 0 && (
              <div className="overflow-hidden">
                <h4 className="text-base font-medium text-purple-500 mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Lancers ({selectedWorkout.throws.length})
                </h4>
                <div className="space-y-3">
                  {selectedWorkout.throws.map((throwItem, index) => (
                    <div key={throwItem.id} className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-800 card-3d">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Lancer #{index + 1}
                          </span>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <div className="text-purple-700 dark:text-purple-300 font-medium text-sm break-words">
                            {throwItem.discipline}
                          </div>
                          <div className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                            {throwItem.distance.toFixed(2)}m
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {throwItem.distance_method && (
                            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                              📏 {throwItem.distance_method === 'theodolite' ? 'Théodolite' : 'Décamètre'}
                            </span>
                          )}
                          {throwItem.wind_speed !== undefined && (
                            <span className="bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded text-xs">
                              💨 {throwItem.wind_speed > 0 ? '+' : ''}{throwItem.wind_speed.toFixed(1)} m/s
                            </span>
                          )}
                          {(throwItem as any).shoe_type && (
                            <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-xs">
                              👟 {(throwItem as any).shoe_type === 'spikes' ? 'Pointes' : 'Baskets'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exercices */}
            {selectedWorkout.exercises.length > 0 && (
              <div>
                <h4 className="text-base font-medium text-secondary-500 mb-3 flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2" />
                  Exercices ({selectedWorkout.exercises.length})
                </h4>
                <div className="space-y-3">
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="bg-secondary-50 dark:bg-secondary-900/20 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-800 card-3d">
                      <div className="flex flex-col space-y-2">
                        <div className="text-secondary-700 dark:text-secondary-300 font-medium text-sm break-words">
                          Exercice #{index + 1}: {exercise.name}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            💪 <strong>{exercise.sets} série{exercise.sets > 1 ? 's' : ''}</strong> × <strong>{exercise.reps} rép.</strong>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {exercise.weight && exercise.weight > 0 && (
                              <span className="bg-secondary-100 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 px-2 py-1 rounded text-xs">
                                🏋️ {exercise.weight}kg
                              </span>
                            )}
                            {(exercise as any).rest_time && (
                              <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                                ⏱️ Repos: {(exercise as any).rest_time}s
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {selectedWorkout.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📝 Notes de l'athlète :</h5>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg card-3d">
                <p className="text-gray-600 dark:text-gray-400 text-sm break-words whitespace-pre-wrap">
                  {selectedWorkout.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Légende */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700 mt-4 card-3d">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Légende :</h4>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-200 dark:bg-primary-800 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Aujourd'hui</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-200 dark:bg-green-800 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Jour avec entraînement</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-gray-600 dark:text-gray-400">Indicateur d'activité</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center break-words">
          💡 Cliquez sur un jour avec entraînement pour voir les détails complets
        </p>
      </div>
    </div>
  );
};