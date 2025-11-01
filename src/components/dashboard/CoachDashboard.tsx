// src/components/dashboard/CoachDashboard.tsx
import React, { useState } from 'react';
import { useLocalStorage } from 'react-use';
import { Loader, AlertTriangle, Users, User, ChevronDown } from 'lucide-react';
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
        <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-neumorphic-extrude">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Bienvenue, {profile?.prenom} !</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Pour commencer, veuillez sélectionner un athlète ou un groupe.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => setAthleteModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105">
              <User /> Athlète
            </button>
            <button onClick={() => setGroupModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105">
              <Users /> Groupe
            </button>
          </div>
        </div>
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
      <div className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-neumorphic-extrude">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Planification
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selection ? `Affichage pour : ${selection.name}` : "Aucune sélection"}
              </p>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Changer
                <ChevronDown size={16} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border dark:border-gray-600 z-10"
                  >
                    <button
                      onClick={() => { setAthleteModalOpen(true); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg"
                    >
                      Voir un athlète
                    </button>
                    <button
                      onClick={() => { setGroupModalOpen(true); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg"
                    >
                      Voir un groupe
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>
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