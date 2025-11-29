// src/components/workouts/WorkoutDetailsModal.tsx
import React from 'react';
import { Workout, CourseBlock, MuscuBlock, WorkoutBlock } from '../../types';
import { X, Calendar, Dumbbell, Navigation, Type, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SmartWorkoutBuilder } from './builder/SmartWorkoutBuilder';

interface WorkoutDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout | null;
}

const BlocDetail: React.FC<{ bloc: any, index: number }> = ({ bloc, index }) => {
  // --- NOUVEAU : DÉTECTION MODE SMART ---
  // Si le bloc possède des rounds (et une config), on utilise le SmartWorkoutBuilder en lecture seule
  if (bloc.rounds && Array.isArray(bloc.rounds)) {
    return (
      <div className="mb-4">
        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{`Bloc ${index + 1}`}</p>
        <SmartWorkoutBuilder initialBlock={bloc as WorkoutBlock} readOnly={true} />
      </div>
    );
  }

  // --- ANCIEN : FALLBACK ---
  if (bloc.type === 'course') {
    const b = bloc as CourseBlock;
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Navigation size={20} className="text-blue-500 dark:text-blue-400 mt-1" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{`Bloc ${index + 1}: Course`}</p>
            <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>{`${b.series} série${b.series > 1 ? 's' : ''} de ${b.reps} x ${b.distance}m`}</p>
              <p>{`Récup entre répétitions: ${b.restBetweenReps}`}</p>
              {b.series > 1 && <p>{`Récup entre séries: ${b.restBetweenSeries}`}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (bloc.type === 'musculation') {
    const b = bloc as MuscuBlock;
    return (
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start space-x-3">
          <Dumbbell size={20} className="text-purple-500 dark:text-purple-400 mt-1" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{`Bloc ${index + 1}: ${b.exerciceNom}`}</p>
            <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>{`${b.series} série${b.series > 1 ? 's' : ''} de ${b.reps} répétitions`}</p>
              <p>{`Poids: ${b.poids ? `${b.poids}kg` : 'Poids du corps'}`}</p>
              <p>{`Temps de repos: ${b.restTime}`}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({ isOpen, onClose, workout }) => {
  if (!isOpen || !workout) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-gray-800 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg m-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{workout.tag_seance}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <X size={24} />
          </button>
        </header>

        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <span>{format(new Date(workout.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Type size={16} className="text-gray-400" />
              <span className="capitalize">{workout.type}</span>
            </div>
            {workout.duration_minutes && (
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-gray-400" />
                <span>{`${workout.duration_minutes} minutes`}</span>
              </div>
            )}
          </div>
          
          {workout.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes du coach</h3>
              <p className="text-gray-300 bg-gray-700/50 p-3 rounded-lg">{workout.notes}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3">Contenu de la séance</h3>
            <div className="space-y-4">
              {workout.planned_data?.blocs && workout.planned_data.blocs.length > 0 ? (
                workout.planned_data.blocs.map((bloc, index) => (
                  <BlocDetail key={bloc.id || index} bloc={bloc} index={index} />
                ))
              ) : (
                <p className="text-gray-400">Aucun bloc planifié pour cette séance.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};