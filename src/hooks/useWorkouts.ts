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
    if (profile?.role === 'coach' && !selection) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('workouts').select('*');

      if (profile?.role === 'coach' && selection) {
        if (selection.type === 'athlete') {
          query = query.eq('user_id', selection.id);
        } else if (selection.type === 'group') {
          query = query.eq('assigned_to_group_id', selection.id);
        }
      } else if (user) {
         const { data: groupMemberships } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('athlete_id', user.id);

        const groupIds = groupMemberships?.map(m => m.group_id) || [];

        let filter = `user_id.eq.${user.id}`;
        if (groupIds.length > 0) {
          filter += `,assigned_to_group_id.in.(${groupIds.join(',')})`;
        }
        query = query.or(filter);
      } else {
        setLoading(false);
        setWorkouts([]);
        return;
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);

    } catch (err: any) {
      setError(err.message);
      console.error("Erreur lors du chargement des séances:", err);
    } finally {
      setLoading(false);
    }
  }, [selection, user, profile]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const planWorkout = async (
    planning: {
      title: string;
      date: string;
      type: 'guidé' | 'manuscrit';
      tag_seance?: string;
      notes?: string;
      planned_data?: { blocs: any[] };
      assigned_to_user_id?: string;
      assigned_to_group_id?: string;
    }
  ) => {
    if (!user || profile?.role !== 'coach') throw new Error('Action non autorisée.');

    const { data, error } = await supabase
      .from('workouts')
      .insert({
        ...planning,
        coach_id: user.id,
        status: 'planned',
        user_id: planning.assigned_to_user_id,
      })
      .select()
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
      .select()
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
      .select()
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


  return {
    workouts,
    loading,
    error,
    planWorkout,
    completeWorkout,
    updateWorkout,
    deleteWorkout,
    refresh: fetchWorkouts,
  };
}
