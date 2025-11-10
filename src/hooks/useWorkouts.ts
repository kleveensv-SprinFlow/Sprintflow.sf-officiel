// src/hooks/useWorkouts.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
import { Workout } from '../types';

type Selection = {
  type: 'athlete' | 'group';
  id: string;
} | null;

export function useWorkouts(selection?: Selection) {
  const { user, profile } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    console.log('🏋️ [useWorkouts] Début chargement workouts');
    console.log('🏋️ [useWorkouts] Profile role:', profile?.role, 'Selection:', selection);

    if (profile?.role === 'coach' && !selection) {
      console.log('ℹ️ [useWorkouts] Coach sans sélection, skip');
      setWorkouts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // CORRECTION : Rend la sélection explicite pour inclure les colonnes JSON
      let query = supabase.from('workouts').select('*, planned_data, workout_data');

      if (profile?.role === 'coach' && selection) {
        console.log('👨‍🏫 [useWorkouts] Chargement pour coach, sélection:', selection.type, selection.id);
        if (selection.type === 'athlete') {
          query = query.eq('user_id', selection.id);
        } else if (selection.type === 'group') {
          query = query.eq('assigned_to_group_id', selection.id);
        }
      } else if (user) {
        console.log('🏋️ [useWorkouts] Chargement pour utilisateur:', user.id);

        // Récupérer les groupes de l'utilisateur avec timeout
        const groupPromise = supabase
          .from('group_members')
          .select('group_id')
          .eq('athlete_id', user.id);

        const { data: groupMemberships } = await Promise.race([
          groupPromise,
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout group memberships')), 5000)
          )
        ]).catch(err => {
          console.warn('⚠️ [useWorkouts] Timeout groupes, continue sans:', err);
          return { data: [], error: null };
        });

        const groupIds = groupMemberships?.map(m => m.group_id) || [];
        console.log('👥 [useWorkouts] Groupes trouvés:', groupIds.length);

        let filter = `user_id.eq.${user.id}`;
        if (groupIds.length > 0) {
          filter += `,assigned_to_group_id.in.(${groupIds.join(',')})`;
        }
        query = query.or(filter);
      } else {
        console.log('⚠️ [useWorkouts] Pas d\'utilisateur');
        setLoading(false);
        setWorkouts([]);
        return;
      }

      console.log('🚀 [useWorkouts] Exécution de la requête...');
      const { data, error } = await Promise.race([
        query.order('date', { ascending: false }),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout workouts query')), 10000)
        )
      ]);

      if (error) throw error;
      console.log('✅ [useWorkouts] Workouts chargés:', data?.length || 0);
      setWorkouts(data || []);

    } catch (err: any) {
      setError(err.message);
      console.error("❌ [useWorkouts] Erreur lors du chargement des séances:", err);
    } finally {
      setLoading(false);
      console.log('✅ [useWorkouts] Chargement terminé');
    }
  }, [selection, user, profile]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const planWorkout = async (
    planning: {
      date: string;
      type: 'guidé' | 'manuscrit' | 'modèle';
      tag_seance?: string;
      notes?: string;
      planned_data?: { blocs: any[] };
      assigned_to_user_id?: string;
      assigned_to_group_id?: string;
    }
  ) => {
    if (!user || profile?.role !== 'coach') throw new Error('Action non autorisée.');

    if (!planning.assigned_to_user_id && !planning.assigned_to_group_id) {
      throw new Error('La séance doit être assignée à un athlète ou à un groupe.');
    }

    const insertData: any = {
      ...planning,
      coach_id: user.id,
      status: 'planned',
    };

    if (planning.assigned_to_user_id) {
      insertData.user_id = planning.assigned_to_user_id;
    } else if (planning.assigned_to_group_id) {
      insertData.user_id = user.id;
    }

    const { data, error } = await supabase
      .from('workouts')
      .insert(insertData)
      .select('*, planned_data, workout_data')
      .single();

    if (error) throw error;
    if (data) {
        setWorkouts(prev => [data, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    return data;
  };

  const completeWorkout = async (
    plannedWorkoutId: string,
    performance: {
      workout_data: { blocs: any[] };
      rpe: number;
      notes?: string;
      duration_minutes?: number;
    }
  ) => {
    if (!user) throw new Error('Utilisateur non connecté.');

    const { data, error } = await supabase
      .from('workouts')
      .update({
        ...performance,
        status: 'completed',
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
      })
      .eq('id', plannedWorkoutId)
      .select('*, planned_data, workout_data')
      .single();

    if (error) throw error;
    if(data){
        setWorkouts(prev => prev.map(w => w.id === plannedWorkoutId ? data : w));
    }
    return data;
  };

  const updateWorkout = async (workoutId: string, updates: Partial<Workout>) => {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', workoutId)
      .select('*, planned_data, workout_data')
      .single();

    if (error) throw error;
    if (data) {
        setWorkouts(prev => prev.map(w => w.id === workoutId ? data : w));
    }
    return data;
  };

  const deleteWorkout = async (workoutId: string) => {
    const { error } = await supabase.from('workouts').delete().eq('id', workoutId);

    if (error) throw error;
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  };

  const createCompletedWorkout = async (
    workoutData: {
      tag_seance: string;
      type: 'guidé' | 'manuscrit';
      notes?: string;
      blocs: any[];
    }
  ) => {
    if (!user) throw new Error('Action non autorisée.');

    const { data, error } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        coach_id: null,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        tag_seance: workoutData.tag_seance,
        type: workoutData.type,
        notes: workoutData.notes,
        workout_data: { blocs: workoutData.blocs },
        planned_data: workoutData.type === 'guidé' ? { blocs: workoutData.blocs } : undefined,
      })
      .select('*, planned_data, workout_data')
      .single();

    if (error) throw error;
    if (data) {
      setWorkouts(prev => [data, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    return data;
  };

  return {
    workouts,
    loading,
    error,
    planWorkout,
    completeWorkout,
    createCompletedWorkout,
    updateWorkout,
    deleteWorkout,
    refresh: fetchWorkouts,
  };
}