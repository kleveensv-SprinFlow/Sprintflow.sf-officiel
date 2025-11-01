import React, { useState } from 'react';
import { Plus, Calendar, Clock, Zap, Wind, Thermometer, Edit2, Trash2, Activity, List, CalendarDays } from 'lucide-react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Workout } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { WorkoutsCalendar } from './WorkoutsCalendar';
import { WorkoutDetailModal } from './WorkoutDetailModal';

interface WorkoutsListProps {
  onAddWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
}

export function WorkoutsList({ onAddWorkout, onEditWorkout }: WorkoutsListProps) {
  const { workouts, loading, deleteWorkout } = useWorkouts();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  console.log('📊 WorkoutsList render - workouts:', workouts.length, 'séances');

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet entraînement ?')) {
      try {
        await deleteWorkout(id);
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Mes Entraînements</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const tagLabels: Record<string, string> = {
    vitesse_max: '⚡ Vitesse Max',
    lactique_piste: '🔥 Lactique Piste',
    lactique_cote: '⛰️ Lactique Côte',
    aerobie: '🫁 Aérobie',
    musculation: '💪 Musculation',
    endurance_lactique: '🔥 Endurance',
    technique_recup: '🧘 Technique'
  };

  const tagColors: Record<string, string> = {
    vitesse_max: 'bg-red-500 text-white',
    lactique_piste: 'bg-orange-500 text-white',
    lactique_cote: 'bg-yellow-500 text-white',
    aerobie: 'bg-blue-500 text-white',
    musculation: 'bg-purple-500 text-white',
    endurance_lactique: 'bg-orange-500 text-white',
    technique_recup: 'bg-green-500 text-white'
  };

  const tagGradients: Record<string, string> = {
    vitesse_max: 'from-red-500 to-red-600',
    lactique_piste: 'from-orange-500 to-orange-600',
    lactique_cote: 'from-yellow-500 to-yellow-600',
    aerobie: 'from-blue-500 to-blue-600',
    musculation: 'from-purple-500 to-purple-600',
    endurance_lactique: 'from-orange-500 to-orange-600',
    technique_recup: 'from-green-500 to-green-600'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">📋 Mes Entraînements</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{workouts.length} séance{workouts.length > 1 ? 's' : ''} enregistrée{workouts.length > 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle vue */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Calendrier</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Liste</span>
            </button>
          </div>

          <button
            onClick={onAddWorkout}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouvelle Séance</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🏃‍♂️</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-shadow-light dark:text-shadow-dark">Aucun entraînement</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-shadow-light dark:text-shadow-dark">Commence à enregistrer tes séances pour suivre ta progression !</p>
            <button
              onClick={onAddWorkout}
              className="btn-primary"
            >
              Créer ma première séance
            </button>
          </div>
        </div>
      ) : viewMode === 'calendar' ? (
        <WorkoutsCalendar
          workouts={workouts}
          onSelectWorkout={setSelectedWorkout}
          onAddWorkout={onAddWorkout}
          dailyData={{}}
        />
      ) : (
        <div className="grid gap-4">
          {workouts.map((workout, index) => {
            const coursesCount = workout.courses_json?.length || 0;
            const muscuCount = workout.muscu_json?.length || 0;
            const sautsCount = workout.sauts_json?.length || 0;
            const lancersCount = workout.lancers_json?.length || 0;
            const totalActivities = coursesCount + muscuCount + sautsCount + lancersCount;

            const formattedDate = workout.date ? format(new Date(workout.date), 'EEEE d MMMM yyyy', { locale: fr }) : '';

            return (
              <motion.div
                key={workout.id}
                className="bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg overflow-hidden group cursor-pointer"
                onClick={() => setSelectedWorkout(workout)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* En-tête coloré selon le type */}
                {workout.tag_seance && (
                  <div className={`bg-gradient-to-r ${tagGradients[workout.tag_seance] || 'from-gray-500 to-gray-600'} px-6 py-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">
                          {workout.tag_seance === 'vitesse_max' && '⚡'}
                          {workout.tag_seance === 'lactique_piste' && '🔥'}
                          {workout.tag_seance === 'lactique_cote' && '⛰️'}
                          {workout.tag_seance === 'aerobie' && '🫁'}
                          {workout.tag_seance === 'musculation' && '💪'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {tagLabels[workout.tag_seance] || workout.tag_seance}
                          </h3>
                          <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                            <Calendar className="w-4 h-4" />
                            <span className="capitalize">{formattedDate}</span>
                          </div>
                        </div>
                      </div>
                      {workout.echelle_effort && (
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-2 text-white">
                            <Activity className="w-5 h-5" />
                            <span className="text-2xl font-bold">{workout.echelle_effort}</span>
                            <span className="text-sm">/10</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contenu principal */}
                <div className="p-6 space-y-4">
                  {/* Statistiques visuelles */}
                  {totalActivities > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {coursesCount > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                          <div className="text-2xl mb-1">🏃</div>
                          <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">{coursesCount}</div>
                          <div className="text-xs text-blue-800 dark:text-blue-400 font-medium">Course{coursesCount > 1 ? 's' : ''}</div>
                        </div>
                      )}
                      {muscuCount > 0 && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                          <div className="text-2xl mb-1">💪</div>
                          <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">{muscuCount}</div>
                          <div className="text-xs text-purple-800 dark:text-purple-400 font-medium">Exercice{muscuCount > 1 ? 's' : ''}</div>
                        </div>
                      )}
                      {sautsCount > 0 && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                          <div className="text-2xl mb-1">🦘</div>
                          <div className="text-2xl font-bold text-green-800 dark:text-green-300">{sautsCount}</div>
                          <div className="text-xs text-green-800 dark:text-green-400 font-medium">Saut{sautsCount > 1 ? 's' : ''}</div>
                        </div>
                      )}
                      {lancersCount > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
                          <div className="text-2xl mb-1">🎯</div>
                          <div className="text-2xl font-bold text-orange-800 dark:text-orange-300">{lancersCount}</div>
                          <div className="text-xs text-orange-800 dark:text-orange-400 font-medium">Lancer{lancersCount > 1 ? 's' : ''}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Détails courses */}
                  {coursesCount > 0 && workout.courses_json && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <div className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <span>🏃</span> Courses
                      </div>
                      <div className="space-y-2">
                        {workout.courses_json.slice(0, 3).map((course, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-800 dark:text-gray-300 font-medium">{course.distance}</span>
                            <div className="flex items-center gap-3">
                              {course.temps && <span className="text-blue-700 dark:text-blue-300 font-bold">{course.temps}s</span>}
                              {course.chaussures && (
                                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-800 dark:text-blue-200 rounded">
                                  {course.chaussures === 'pointes' ? '👟 Pointes' : '👟 Baskets'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {coursesCount > 3 && (
                          <div className="text-xs text-blue-700 dark:text-blue-400 text-center pt-1">
                            +{coursesCount - 3} autre{coursesCount - 3 > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Détails musculation */}
                  {muscuCount > 0 && workout.muscu_json && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <div className="font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                        <span>💪</span> Musculation
                      </div>
                      <div className="space-y-2">
                        {workout.muscu_json.slice(0, 3).map((ex, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-800 dark:text-gray-300 font-medium">{ex.exercice_nom}</span>
                            <span className="text-purple-700 dark:text-purple-300 font-bold">
                              {ex.series} × {ex.reps} @ {ex.poids}kg
                            </span>
                          </div>
                        ))}
                        {muscuCount > 3 && (
                          <div className="text-xs text-purple-700 dark:text-purple-400 text-center pt-1">
                            +{muscuCount - 3} autre{muscuCount - 3 > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Conditions météo */}
                  {(workout.meteo || workout.temperature) && (
                    <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                      {workout.meteo && (
                        <div className="flex items-center gap-1">
                          <Wind className="w-4 h-4" />
                          <span>{workout.meteo}</span>
                        </div>
                      )}
                      {workout.temperature && (
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-4 h-4" />
                          <span>{workout.temperature}°C</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {workout.notes && (
                    <div className="bg-black/10 border border-white/20 rounded-lg p-3">
                      <p className="text-sm text-gray-800 dark:text-gray-300 italic line-clamp-2">
                        "{workout.notes}"
                      </p>
                    </div>
                  )}

                  {/* Indication pour cliquer */}
                  <div className="text-center text-sm text-gray-700 dark:text-gray-300 pt-2 border-t border-white/20">
                    👆 Cliquer pour voir les détails
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de détails */}
      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onEdit={() => {
            onEditWorkout(selectedWorkout);
            setSelectedWorkout(null);
          }}
          onDelete={async () => {
            await handleDelete(selectedWorkout.id);
            setSelectedWorkout(null);
          }}
        />
      )}
    </div>
  );
}
