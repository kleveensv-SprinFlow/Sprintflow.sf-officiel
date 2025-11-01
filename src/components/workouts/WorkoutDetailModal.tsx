import React from 'react';
import { X, Calendar, Activity, Wind, Thermometer, Edit2, Trash2 } from 'lucide-react';
import { Workout } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WorkoutDetailModalProps {
  workout: Workout;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function WorkoutDetailModal({ workout, onClose, onEdit, onDelete }: WorkoutDetailModalProps) {
  const tagLabels: Record<string, string> = {
    vitesse_max: '⚡ Vitesse Max',
    lactique_piste: '🔥 Lactique Piste',
    lactique_cote: '⛰️ Lactique Côte',
    aerobie: '🫁 Aérobie',
    musculation: '💪 Musculation',
    endurance_lactique: '🔥 Endurance',
    technique_recup: '🧘 Technique'
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

  const formattedDate = workout.date ? format(new Date(workout.date), 'EEEE d MMMM yyyy', { locale: fr }) : '';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md dark:backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête coloré */}
        {workout.tag_seance && (
          <div className={`bg-gradient-to-r ${tagGradients[workout.tag_seance] || 'from-gray-500 to-gray-600'} px-6 py-5`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {tagLabels[workout.tag_seance] || workout.tag_seance}
                </h2>
                <div className="flex items-center gap-2 text-white/90">
                  <Calendar className="w-4 h-4" />
                  <span className="capitalize text-sm">{formattedDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {workout.echelle_effort && (
                  <div className="bg-white/20 backdrop-blur-md dark:backdrop-blur-sm px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2 text-white">
                      <Activity className="w-5 h-5" />
                      <span className="text-2xl font-bold">{workout.echelle_effort}</span>
                      <span className="text-sm">/10</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenu scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
          {/* Courses */}
          {workout.courses_json && workout.courses_json.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                <span className="text-2xl">🏃</span>
                Courses ({workout.courses_json.length})
              </h3>
              <div className="space-y-3">
                {workout.courses_json.map((course, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        Course #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {course.terrain && (
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            course.terrain === 'piste'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                          }`}>
                            {course.terrain === 'piste' ? '🏟️ Piste' : '⛰️ Côte'}
                          </span>
                        )}
                        {course.chaussures && (
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            course.chaussures === 'pointes'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {course.chaussures === 'pointes' ? '👟 Pointes' : '👟 Baskets'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Distance</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{course.distance}</div>
                      </div>
                      {course.temps && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Temps</div>
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{course.temps}s</div>
                        </div>
                      )}
                      {course.type_chrono && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chrono</div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{course.type_chrono}</div>
                        </div>
                      )}
                    </div>
                    {course.repos && (
                      <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Repos</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">{course.repos}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Musculation */}
          {workout.muscu_json && workout.muscu_json.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-5">
              <h3 className="text-xl font-bold text-purple-900 dark:text-purple-300 mb-4 flex items-center gap-2">
                <span className="text-2xl">💪</span>
                Musculation ({workout.muscu_json.length})
              </h3>
              <div className="space-y-3">
                {workout.muscu_json.map((ex, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-3">
                      {ex.exercice_nom}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Séries</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ex.series}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Répétitions</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ex.reps}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Poids</div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{ex.poids}kg</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sauts */}
          {workout.sauts_json && workout.sauts_json.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 rounded-xl p-5">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4 flex items-center gap-2">
                <span className="text-2xl">🦘</span>
                Sauts ({workout.sauts_json.length})
              </h3>
              <div className="space-y-2">
                {workout.sauts_json.map((saut, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-800 flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{saut.type}</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">{saut.hauteur}cm</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lancers */}
          {workout.lancers_json && workout.lancers_json.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-5">
              <h3 className="text-xl font-bold text-orange-900 dark:text-orange-300 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Lancers ({workout.lancers_json.length})
              </h3>
              <div className="space-y-2">
                {workout.lancers_json.map((lancer, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-orange-200 dark:border-orange-800 flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{lancer.type}</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">{lancer.distance}m</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Autres activités */}
          {workout.autres_activites && (
            <div className="bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <span>📝</span>
                Autres activités
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{workout.autres_activites}</p>
            </div>
          )}

          {/* Conditions météo */}
          {(workout.meteo || workout.temperature) && (
            <div className="bg-sky-50 dark:bg-sky-900/10 border-2 border-sky-200 dark:border-sky-800 rounded-xl p-5">
              <h3 className="text-lg font-bold text-sky-900 dark:text-sky-300 mb-3">Conditions</h3>
              <div className="flex items-center gap-4">
                {workout.meteo && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Wind className="w-5 h-5" />
                    <span className="font-medium">{workout.meteo}</span>
                  </div>
                )}
                {workout.temperature && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Thermometer className="w-5 h-5" />
                    <span className="font-medium">{workout.temperature}°C</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {workout.notes && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
              <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-300 mb-3 flex items-center gap-2">
                <span>💭</span>
                Notes
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic">
                "{workout.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="border-t-2 border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
            >
              <Edit2 className="w-5 h-5" />
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-lg"
            >
              <Trash2 className="w-5 h-5" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
