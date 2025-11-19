// src/components/dashboard/CoachDashboard.tsx
import React, { useState } from 'react';
import { useLocalStorage } from 'react-use';
import { Loader, AlertTriangle, Users, User, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
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

  const { coachAthletes } = useGroups();
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);

  const { workouts, loading, error, planWorkout, updateWorkout } = useWorkouts(selection || undefined);

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
    } catch (e) {
      if (e instanceof Error) {
        alert(`Erreur: ${e.message}`);
      } else {
        alert('Une erreur inconnue est survenue.');
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
              className="p-2 bg-light-card dark:bg-dark-card/60 backdrop-blur-lg rounded-full shadow-lg border border-white/20 dark:border-white/10"
            >
              <Settings2 size={20} className="text-light-text dark:text-dark-text" />
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card shadow-xl origin-top-right rounded-lg"
                >
                  <p className="px-4 py-2 text-xs text-light-label dark:text-dark-label border-b border-gray-200 dark:border-gray-700">Changer de vue</p>
                  <button
                    onClick={() => { setAthleteModalOpen(true); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User size={16} /> Athlète
                  </button>
                  <button
                    onClick={() => { setGroupModalOpen(true); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700"
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
                className="text-center py-16 px-4 bg-light-card dark:bg-dark-card shadow-card-light dark:shadow-card-dark rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <h2 className="text-2xl font-bold mb-4 text-light-title dark:text-dark-title">Bienvenue, {profile?.first_name} !</h2>
                <p className="text-light-text dark:text-dark-text mb-8">Pour commencer, veuillez sélectionner un athlète ou un groupe.</p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <button onClick={() => setAthleteModalOpen(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 font-semibold rounded-lg text-white bg-accent hover:opacity-90 transition-all duration-300 ease-in-out shadow-md transform hover:scale-105">
                    <User /> Athlète
                  </button>
                  <button onClick={() => setGroupModalOpen(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 font-semibold rounded-lg text-light-title dark:text-dark-title bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out shadow-md transform hover:scale-105">
                    <Users /> Groupe
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-light-title dark:text-dark-title mb-4">Planning de <span className="text-accent">{selection.name}</span></h1>
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

                <div>
                  <h2 className="text-2xl font-bold text-light-title dark:text-dark-title mb-4">Mes Athlètes</h2>
                  <AthleteMarquee athletes={coachAthletes || []} onAthleteClick={handleAthleteMarqueeClick} />
                </div>
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