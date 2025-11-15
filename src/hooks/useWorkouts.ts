import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
import { Workout } from '../types';
import { logger } from '../utils/logger';

type Selection = {
  type: 'athlete' | 'group';
  id: string;
} | null;

export function useWorkouts(selection?: Selection) {
  const { user, profile, loading: authLoading } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    logger.info('[useWorkouts] Début chargement workouts');
    logger.debug('[useWorkouts] Profile role:', profile?.role, 'Selection:', selection, 'AuthLoading:', authLoading);

    if (authLoading) {
      logger.info('[useWorkouts] ⏳ En attente de l\'initialisation auth complète...');
      setLoading(true);
      return;
    }

    if (!user) {
      logger.warn('[useWorkouts] 🚫 Pas d\'utilisateur connecté');
      setWorkouts([]);
      setLoading(false);
      return;
    }

    if (!profile) {
      logger.warn('[useWorkouts] ⚠️ Profil non disponible après initialisation auth');
      setWorkouts([]);
      setLoading(false);
      return;
    }

    if (profile.role === 'coach' && !selection) {
      logger.info('[useWorkouts] Coach sans sélection, skip');
      setWorkouts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let mainTimerId: string = '';
    let groupTimerId: string = '';

    try {
      mainTimerId = logger.time('[useWorkouts] Temps total de chargement');
      let query = supabase.from('workouts').select('*');

      if (profile?.role === 'coach' && selection) {
        logger.info('[useWorkouts] Chargement pour coach, sélection:', selection.type, selection.id);
        if (selection.type === 'athlete') {
          query = query.eq('user_id', selection.id);
        } else if (selection.type === 'group') {
          query = query.eq('assigned_to_group_id', selection.id);
        }
      } else {
        logger.info('[useWorkouts] Chargement pour utilisateur:', user.id);

        try {
          groupTimerId = logger.time('[useWorkouts] Temps requête group_members');

          const groupMembershipsPromise = supabase
            .from('group_members')
            .select('group_id')
            .eq('athlete_id', user.id);

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout group_members après 12s')), 12000)
          );

          const { data: groupMemberships, error: groupError } = await Promise.race([
            groupMembershipsPromise,
            timeoutPromise
          ]) as any;

          logger.timeEnd(groupTimerId);

          if (groupError) {
            logger.warn('[useWorkouts] Erreur group_members:', groupError);
            throw groupError;
          }

          const groupIds = groupMemberships?.map((m: any) => m.group_id) || [];
          logger.info('[useWorkouts] Groupes trouvés:', groupIds.length);

          let filter = `user_id.eq.${user.id},assigned_to_user_id.eq.${user.id}`;
          if (groupIds.length > 0) {
            filter += `,assigned_to_group_id.in.(${groupIds.join(',')})`;
          }
          query = query.or(filter);
        } catch (groupError) {
          if (groupTimerId) logger.timeEnd(groupTimerId);
          logger.warn('[useWorkouts] Erreur/timeout groupes, charge uniquement user:', groupError);
          query = query.or(`user_id.eq.${user.id},assigned_to_user_id.eq.${user.id}`);
        }
      }

      logger.info('[useWorkouts] Exécution de la requête workouts...');
      const { data, error } = await query.order('date', { ascending: false });

      logger.timeEnd(mainTimerId);

      if (error) {
        logger.error('[useWorkouts] Erreur Supabase:', error);
        logger.error('[useWorkouts] Code erreur:', error.code, 'Message:', error.message);
        throw error;
      }

      logger.info('[useWorkouts] Workouts chargés:', data?.length || 0);
      setWorkouts(data || []);

    } catch (err: any) {
      if (mainTimerId) logger.timeEnd(mainTimerId);
      if (groupTimerId) logger.timeEnd(groupTimerId);
      setError(err.message);
      logger.error('[useWorkouts] Erreur lors du chargement des séances:', err);
      setWorkouts([]);
    } finally {
      setLoading(false);
      logger.info('[useWorkouts] Chargement terminé');
    }
  }, [selection, user, profile, authLoading]);

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
      .select()
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