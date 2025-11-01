// src/components/dashboard/CoachDashboard.tsx
import React, { useState } from 'react';
import { useLocalStorage } from 'react-use';
import { Loader, AlertTriangle, Users, User, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyPlanCarousel } from './DailyPlanCarousel';
import { AthleteSelectionModal } from './AthleteSelectionModal';
import { GroupSelectionModal } from './GroupSelectionModal';
import { NewWorkoutForm } from '../workouts/NewWorkoutForm';
import { useWorkouts } from '../../hooks/useWorkouts';
import useAuth from '../../hooks/useAuth';
import { Workout } from '../../types';

type Selection = {
  type: 'athlete' | 'group';
  id: string;
  name: string;
} | null;

type FormState = {
  isOpen: boolean;
  initialData?: any;
  date?: Date;
}

export const CoachDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [selection, setSelection] = useLocalStorage<Selection>('coach-dashboard-selection', null);

  const [isAthleteModalOpen, setAthleteModalOpen] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({ isOpen: false });

  const { workouts, loading, error, planWorkout, updateWorkout } = useWorkouts(selection || undefined);

  const handleSelectAthlete = (athlete: { id: string; name: string }) => {
    setSelection({ type: 'athlete', ...athlete });
    setAthleteModalOpen(false);
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
        ...workoutToEdit,
        blocs: workoutToEdit.planned_data?.blocs || [],
      }
    });
  };

  const handleSaveWorkout = async (payload: any) => {
    if (!selection) return;

    const isEditing = !!formState.initialData?.id;

    const workoutPayload = {
      title: payload.title,
      type: payload.type,
      notes: payload.notes,
      planned_data: { blocs: payload.blocs },
      date: isEditing ? formState.initialData.date : format(formState.date!, 'yyyy-MM-dd'),
      assigned_to_user_id: selection.type === 'athlete' ? selection.id : undefined,
      assigned_to_group_id: selection.type === 'group' ? selection.id : undefined,
    };

    try {
      if (isEditing) {
        await updateWorkout(formState.initialData.id, workoutPayload);
      } else {
        await planWorkout(workoutPayload);
      }
      setFormState({ isOpen: false });
    } catch (e: any) {
      alert(`Erreur: ${e.message}`);
    }
  };

  const renderContent = () => {
    if (!selection) {
      return (
        <motion.div 
          className="text-center py-16 px-4 bg-white/10 dark:bg-black/10 backdrop-blur-md dark:backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 text-shadow-light dark:text-shadow-dark">Bienvenue, {profile?.prenom} !</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-shadow-light dark:text-shadow-dark">Pour commencer, veuillez sélectionner un athlète ou un groupe.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button onClick={() => setAthleteModalOpen(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
              <User /> Athlète
            </button>
            <button onClick={() => setGroupModalOpen(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
              <Users /> Groupe
            </button>
          </div>
        </motion.div>
      );
    }

    if (loading) {
      return <div className="flex justify-center items-center py-16"><Loader className="w-12 h-12 animate-spin text-primary-500" /></div>;
    }
    if (error) {
      return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center"><AlertTriangle className="w-6 h-6 mr-3" /><p>{error}</p></div>;
    }

    return <DailyPlanCarousel workouts={workouts} onPlanClick={handlePlanClick} onEditClick={handleEditClick} />;
  };

  return (
    <>
      <div className="p-4 sm:p-6 bg-transparent min-h-screen relative">
        <div className="max-w-7xl mx-auto">
          {/* Menu flottant pour changer la vue */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md dark:backdrop-blur-sm rounded-full shadow-lg"
            >
              <Settings2 size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl border dark:border-gray-600 origin-top-right"
                >
                  <p className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-600">Changer de vue</p>
                  <button
                    onClick={() => { setAthleteModalOpen(true); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <User size={16} /> Athlète
                  </button>
                  <button
                    onClick={() => { setGroupModalOpen(true); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Users size={16} /> Groupe
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {renderContent()}
        </div>

        <AthleteSelectionModal isOpen={isAthleteModalOpen} onClose={() => setAthleteModalOpen(false)} onSelect={handleSelectAthlete} />
        <GroupSelectionModal isOpen={isGroupModalOpen} onClose={() => setGroupModalOpen(false)} onSelect={handleSelectGroup} />
      </div>

      {formState.isOpen && (
        <NewWorkoutForm
          onSave={handleSaveWorkout}
          onCancel={() => setFormState({ isOpen: false })}
          initialData={formState.initialData}
        />
      )}
    </>
  );
};