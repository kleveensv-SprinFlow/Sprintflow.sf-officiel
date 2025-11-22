// src/components/dashboard/CoachDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from 'react-use';
import { Loader, AlertTriangle, Users, User, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { AthleteSelectionModal } from './AthleteSelectionModal';
import { GroupSelectionModal } from './GroupSelectionModal';
import { CoachDailyPlanCarousel } from './CoachDailyPlanCarousel';
import { NewWorkoutForm } from '../workouts/NewWorkoutForm';
import { WorkoutDetailsModal } from '../workouts/WorkoutDetailsModal';
import { useWorkouts } from '../../hooks/useWorkouts';
import useAuth from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import { AthleteMarquee } from './AthleteMarquee';
import { AthleteDetails } from '../groups/AthleteDetails';
import { GroupWellnessGauge } from './GroupWellnessGauge.tsx';
import { GroupRecordsCarousel } from './GroupRecordsCarousel.tsx';
import { useGroupAnalytics } from '../../hooks/useGroupAnalytics';
import { Profile, Workout } from '../../types';
import { WorkoutBlock } from '../workouts/WorkoutBuilder';

type Selection = {
  type: 'athlete' | 'group';
  id: string;
  name: string;
} | null;

type FormState = {
  isOpen: boolean;
  initialData?: {
    id: string;
    tag_seance: string;
    blocs: WorkoutBlock[];
    type?: 'guidé' | 'manuscrit' | 'modèle';
    notes?: string;
    date: string;
  };
  date?: Date;
}

export const CoachDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [selection, setSelection] = useLocalStorage<Selection>('coach-dashboard-selection', null);

  const [isAthleteModalOpen, setAthleteModalOpen] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({ isOpen: false });
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);

  const { coachAthletes, groups, loading: groupsLoading } = useGroups();
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);

  const { workouts, loading, error, planWorkout, updateWorkout } = useWorkouts(selection || undefined);

  // Group Analytics Hook - only fetches if selection is a group
  const { groupRecords, groupWellnessScore, loading: analyticsLoading } = useGroupAnalytics(
    selection?.type === 'group' ? selection.id : undefined
  );

  // Auto-selection logic: if nothing is selected, select the first group or athlete automatically
  useEffect(() => {
    if (!selection && !groupsLoading) {
      if (groups && groups.length > 0) {
        setSelection({ type: 'group', id: groups[0].id, name: groups[0].name });
      } else if (coachAthletes && coachAthletes.length > 0) {
        const firstAthlete = coachAthletes[0];
        const name = `${firstAthlete.first_name} ${firstAthlete.last_name || ''}`.trim();
        setSelection({
          type: 'athlete',
          id: firstAthlete.id,
          name: name
        });
      }
    }
  }, [selection, groups, coachAthletes, groupsLoading, setSelection]);


  const handleSelectAthlete = (athlete: { id: string; name: string }) => {
    setSelection({ type: 'athlete', ...athlete });
    setAthleteModalOpen(false);
  };

  const handleAthleteMarqueeClick = (athleteId: string) => {
    const athlete = coachAthletes?.find(a => a.id === athleteId);
    if (athlete) {
      setSelectedAthlete(athlete);
    }
  };

  const handleSelectGroup = (group: { id: string; name: string }) => {
    setSelection({ type: 'group', ...group });
    setGroupModalOpen(false);
  };

  const handlePlanClick = (date: Date) => {
    if (!selection) return;
    setFormState({ isOpen: true, date });
  };

  const handleEditClick = (workoutId: string) => {
    const workoutToEdit = workouts.find(w => w.id === workoutId);
    if (!workoutToEdit) return;

    setFormState({
      isOpen: true,
      initialData: {
        id: workoutToEdit.id,
        tag_seance: workoutToEdit.tag_seance,
        blocs: workoutToEdit.planned_data?.blocs || [],
        type: workoutToEdit.type,
        notes: workoutToEdit.notes,
        date: workoutToEdit.date,
      }
    });
  };
  
  const handleViewWorkout = (workoutId: string) => {
    const workoutToShow = workouts.find(w => w.id === workoutId);
    if (workoutToShow) {
      setViewingWorkout(workoutToShow);
    }
  };

  const handleSaveWorkout = async (payload: { tag_seance: string; type: 'guidé' | 'manuscrit' | 'modèle'; notes?: string; blocs: WorkoutBlock[] }) => {
    if (!selection) return;

    const isEditing = !!formState.initialData?.id;

    // Prépare le payload de base avec les données du formulaire
    const workoutPayload = {
      tag_seance: payload.tag_seance,
      type: payload.type,
      notes: payload.notes,
      planned_data: { blocs: payload.blocs },
    };

    try {
      if (isEditing) {
        // En mode édition, on appelle `updateWorkout` avec l'ID et le payload
        await updateWorkout(formState.initialData!.id, workoutPayload);
      } else {
        // En mode création, on ajoute la date et l'assignation
        const creationPayload = {
            ...workoutPayload,
            date: format(formState.date!, 'yyyy-MM-dd'),
            assigned_to_user_id: selection.type === 'athlete' ? selection.id : undefined,
            assigned_to_group_id: selection.type === 'group' ? selection.id : undefined,
        };
        await planWorkout(creationPayload);
      }
      setFormState({ isOpen: false, initialData: undefined, date: undefined });
      toast.success('Séance enregistrée avec succès !');
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`Erreur: ${e.message}`);
      } else {
        toast.error('Une erreur inconnue est survenue.');
      }
    }
  };

  if (selectedAthlete) {
    return <AthleteDetails athlete={selectedAthlete} onBack={() => setSelectedAthlete(null)} />;
  }

  return (
    <>
      <div className="pt-2 sm:pt-4 p-4 bg-transparent min-h-screen relative">
        <div className="max-w-7xl mx-auto">
          {/* Menu flottant pour changer la vue */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings2 size={20} className="text-gray-700 dark:text-gray-200" />
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl origin-top-right rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 uppercase tracking-wider">Changer de vue</p>
                  <button
                    onClick={() => { setAthleteModalOpen(true); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <User size={16} /> Athlète
                  </button>
                  <button
                    onClick={() => { setGroupModalOpen(true); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Users size={16} /> Groupe
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="space-y-6">
            {!selection ? (
              <motion.div 
                className="text-center py-16 px-4 bg-white dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <h2 className="text-3xl font-extrabold mb-4 text-gray-900 dark:text-white">Bienvenue, {profile?.first_name} !</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">Pour commencer à planifier ou analyser, veuillez sélectionner un athlète ou un groupe.</p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <button onClick={() => setAthleteModalOpen(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 font-bold rounded-xl text-white bg-accent hover:bg-accent/90 transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105 active:scale-95">
                    <User className="w-5 h-5" /> Sélectionner un Athlète
                  </button>
                  <button onClick={() => setGroupModalOpen(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 font-bold rounded-xl text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105 active:scale-95">
                    <Users className="w-5 h-5" /> Sélectionner un Groupe
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Planning de <span className="text-accent">{selection.name}</span></h1>
                  {loading && <div className="flex justify-center items-center py-16"><Loader className="w-12 h-12 animate-spin text-accent" /></div>}
                  {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center"><AlertTriangle className="w-6 h-6 mr-3" /><p>{error}</p></div>}
                  {!loading && !error && (
                    <CoachDailyPlanCarousel 
                      selection={selection} 
                      onPlanWorkout={handlePlanClick}
                      onEditWorkout={handleEditClick}
                      onViewWorkout={handleViewWorkout}
                    />
                  )}
                </div>

                {/* Group Analytics Section */}
                {selection.type === 'group' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <GroupWellnessGauge score={groupWellnessScore} loading={analyticsLoading} />
                        <GroupRecordsCarousel records={groupRecords} loading={analyticsLoading} />
                    </motion.div>
                )}

                {/* Athlete Marquee - Only show for athlete selection or if not a group (though selection forces one of two) */}
                {selection.type !== 'group' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mes Athlètes</h2>
                    <AthleteMarquee athletes={coachAthletes || []} onAthleteClick={handleAthleteMarqueeClick} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <AthleteSelectionModal isOpen={isAthleteModalOpen} onClose={() => setAthleteModalOpen(false)} onSelect={handleSelectAthlete} />
        <GroupSelectionModal isOpen={isGroupModalOpen} onClose={() => setGroupModalOpen(false)} onSelect={handleSelectGroup} />
      </div>

      {formState.isOpen && (
        <NewWorkoutForm
          userRole="coach"
          onSave={handleSaveWorkout}
          onCancel={() => setFormState({ isOpen: false, initialData: undefined, date: undefined })}
          initialData={formState.initialData}
        />
      )}
      
      <WorkoutDetailsModal 
        isOpen={!!viewingWorkout}
        onClose={() => setViewingWorkout(null)}
        workout={viewingWorkout}
      />
    </>
  );
};
