import React, { useState, useEffect } from 'react';
import { useLocalStorage } from 'react-use';
import { Users, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import { AthleteSelectionModal } from './AthleteSelectionModal';
import { GroupSelectionModal } from './GroupSelectionModal';
import { NewWorkoutForm } from '../workouts/NewWorkoutForm';
import { WorkoutDetailsModal } from '../workouts/WorkoutDetailsModal';
import { useWorkouts } from '../../hooks/useWorkouts';
import useAuth from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import { AthleteDetails } from '../groups/AthleteDetails';
import { Profile, Workout } from '../../types';
import { WorkoutBlock } from '../workouts/WorkoutBuilder';
import SelectionHeader from './SelectionHeader';
import CoachWorkoutCard from './CoachWorkoutCard';
import HealthIndexCard from './HealthIndexCard';

type Selection = {
  type: 'athlete' | 'group';
  id: string;
  name: string;
  color?: string;
} | null;

type FormState = {
  isOpen: boolean;
  initialData?: { id: string; tag_seance: string; blocs: WorkoutBlock[]; type?: any; notes?: string; date: string; };
  date?: Date;
}

export const CoachDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [selection, setSelection] = useLocalStorage<Selection>('coach-dashboard-selection', null);

  const [isAthleteModalOpen, setAthleteModalOpen] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({ isOpen: false });
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);

  const { coachAthletes, groups, loading: groupsLoading } = useGroups();
  const [selectedAthlete, setSelectedAthlete] = useState<Profile | null>(null);
  const { workouts, planWorkout, updateWorkout } = useWorkouts(selection || undefined);

  useEffect(() => {
    if (!selection && !groupsLoading) {
      if (groups && groups.length > 0) {
        setSelection({ type: 'group', id: groups[0].id, name: groups[0].name, color: groups[0].color });
      } else if (coachAthletes && coachAthletes.length > 0) {
        const firstAthlete = coachAthletes[0];
        const name = `${firstAthlete.first_name} ${firstAthlete.last_name || ''}`.trim();
        setSelection({ type: 'athlete', id: firstAthlete.id, name: name });
      }
    }
  }, [selection, groups, coachAthletes, groupsLoading, setSelection]);

  const handleSelectAthlete = (athlete: { id: string; name: string }) => {
    setSelection({ type: 'athlete', ...athlete });
    setAthleteModalOpen(false);
  };

  const handleSelectGroup = (group: { id: string; name: string; color?: string }) => {
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
    if (workoutToShow) setViewingWorkout(workoutToShow);
  };

  const handleSaveWorkout = async (payload: any) => {
    if (!selection) return;
    const isEditing = !!formState.initialData?.id;
    try {
      if (isEditing) {
        await updateWorkout(formState.initialData!.id, payload);
      } else {
        const creationPayload = {
            ...payload,
            date: format(formState.date!, 'yyyy-MM-dd'),
            assigned_to_user_id: selection.type === 'athlete' ? selection.id : undefined,
            assigned_to_group_id: selection.type === 'group' ? selection.id : undefined,
        };
        await planWorkout(creationPayload);
      }
      setFormState({ isOpen: false });
      toast.success('Séance enregistrée !');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (selectedAthlete) {
    return <AthleteDetails athlete={selectedAthlete} onBack={() => setSelectedAthlete(null)} />;
  }

  return (
    <>
      <div className="p-4">
        <SelectionHeader
          selection={selection}
          onSelectAthlete={() => setAthleteModalOpen(true)}
          onSelectGroup={() => setGroupModalOpen(true)}
        />

        <div className="space-y-6">
          {!selection ? (
            <motion.div className="text-center py-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold mb-4">Bienvenue, {profile?.first_name} !</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">Sélectionnez un athlète ou un groupe pour commencer.</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setAthleteModalOpen(true)} className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-white bg-accent">
                  <User size={16} /> Athlète
                </button>
                <button onClick={() => setGroupModalOpen(true)} className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl bg-gray-100 dark:bg-gray-700">
                  <Users size={16} /> Groupe
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <CoachWorkoutCard
                selection={selection}
                onPlan={handlePlanClick}
                onEdit={handleEditClick}
                onView={handleViewWorkout}
              />
              <HealthIndexCard selection={selection} />
            </>
          )}
        </div>

        <AthleteSelectionModal isOpen={isAthleteModalOpen} onClose={() => setAthleteModalOpen(false)} onSelect={handleSelectAthlete} />
        <GroupSelectionModal isOpen={isGroupModalOpen} onClose={() => setGroupModalOpen(false)} onSelect={handleSelectGroup} />
      </div>

      {formState.isOpen && (
        <NewWorkoutForm
          userRole="coach"
          onSave={handleSaveWorkout}
          onCancel={() => setFormState({ isOpen: false })}
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
