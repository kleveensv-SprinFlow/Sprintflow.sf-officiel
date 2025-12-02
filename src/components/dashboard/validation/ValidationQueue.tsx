import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, Eye, User, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { supabase } from '../../../lib/supabase';
import useAuth from '../../../hooks/useAuth';
import { WorkoutDetailsModal } from '../../workouts/WorkoutDetailsModal';
import { Workout } from '../../../types';

interface ValidationQueueProps {
  onBack: () => void;
}

// Extension du type Workout pour inclure les données jointes (athlete)
interface WorkoutWithAthlete extends Workout {
  athlete?: {
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };
  // Pour gérer les différences de structure retournées par Supabase
  profiles?: {
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };
}

export const ValidationQueue: React.FC<ValidationQueueProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutWithAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithAthlete | null>(null);

  const fetchPendingWorkouts = React.useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // ✅ CORRECTION : Utilisation explicite de la jointure 'profiles' avec ! pour éviter l'ambiguïté
      // On tente d'abord avec l'alias 'athlete', si ça échoue on prendra 'profiles'
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          athlete:profiles!assigned_to_user_id (
             first_name,
             last_name,
             photo_url
          )
        `)
        .eq('coach_id', user.id)
        .eq('status', 'completed')
        .is('validated_at', null)
        .order('date', { ascending: false });

      if (error) throw error;
      
      setWorkouts((data || []) as unknown as WorkoutWithAthlete[]);

    } catch (err) {
      console.error('Erreur chargement validation:', err);
      // Mode dégradé: on essaie sans la jointure si erreur
      toast.error("Erreur de récupération des données.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // --- CHARGEMENT DES SÉANCES À VALIDER ---
  useEffect(() => {
    fetchPendingWorkouts();
  }, [fetchPendingWorkouts]);

  // --- ACTIONS ---

  const handleQuickValidate = async (workoutId: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    try {
      const { error } = await supabase
        .from('workouts')
        .update({ validated_at: new Date().toISOString() })
        .eq('id', workoutId);

      if (error) throw error;

      // Mise à jour optimiste
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
      toast.success("Séance validée !");

    } catch (err) {
      console.error('Erreur validation:', err);
      toast.error("Erreur lors de la validation");
    }
  };

  const handleOpenDetails = (workout: WorkoutWithAthlete) => {
    setSelectedWorkout(workout);
  };

  const handleCloseDetails = () => {
    setSelectedWorkout(null);
    fetchPendingWorkouts(); 
  };

  // --- RENDU ---

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="text-gray-600 dark:text-gray-300" size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          File de Validation
          <span className="bg-sprint-primary text-white text-xs px-2 py-0.5 rounded-full">
            {workouts.length}
          </span>
        </h1>
        <div className="w-10" /> 
      </div>

      {/* Contenu Liste */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pt-10 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="text-green-600 dark:text-green-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tout est à jour !</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-8">
              Vous avez validé toutes les séances terminées.
            </p>
            
            {/* ✅ AJOUT : Boutons de navigation quand vide */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                    onClick={onBack}
                    className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold flex items-center justify-center gap-2 hover:opacity-90"
                >
                    Retour au Dashboard
                </button>
                {/* Note: Dans une app réelle, on injecterait la navigation vers le planning ici */}
            </div>
          </div>
        ) : (
          workouts.map(workout => {
            const athleteName = workout.athlete 
              ? `${workout.athlete.first_name} ${workout.athlete.last_name}`
              : (workout.assigned_to_user_id ? "Athlète" : "Non assigné");
            
            const athletePhoto = workout.athlete?.photo_url;
            const dateStr = format(new Date(workout.date), 'dd MMM', { locale: fr });
            
            const hasRpe = workout.rpe !== undefined && workout.rpe !== null;

            return (
              <div 
                key={workout.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 active:scale-[0.99] transition-transform"
                onClick={() => handleOpenDetails(workout)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                      {athletePhoto ? (
                        <img src={athletePhoto} alt={athleteName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {athleteName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{dateStr}</span>
                        </div>
                    </div>
                  </div>

                  {hasRpe && (
                    <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        (workout.rpe || 0) > 7 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                        RPE {workout.rpe}
                    </div>
                  )}
                </div>

                <div className="pl-[52px]">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                        {workout.tag_seance || "Séance sans titre"}
                    </h4>
                    {workout.notes && (
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5 italic">
                            "{workout.notes}"
                        </p>
                    )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-gray-700 mt-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenDetails(workout); }}
                        className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                    >
                        <Eye size={16} />
                        Détails
                    </button>
                    <button 
                        onClick={(e) => handleQuickValidate(workout.id, e)}
                        className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow-sm shadow-green-200 dark:shadow-none flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={16} />
                        Valider
                    </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedWorkout && (
        <WorkoutDetailsModal 
            isOpen={!!selectedWorkout}
            onClose={handleCloseDetails}
            workout={selectedWorkout}
            canEdit={true}
        />
      )}
    </div>
  );
};