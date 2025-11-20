// Updated version of useWorkouts hook with timeout handling and improved error logging
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
import { Workout } from '../types';
import { logger } from '../utils/logger';

// Type representing the current selection for coaches
type Selection = { type: 'athlete' | 'group'; id: string; } | null;

// Helper to wrap a Promise with a timeout
function withTimeout<T>(promise: Promise<T>, ms: number, description = 'Opération'): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout: ${description} n'a pas répondu dans les ${ms / 1000} secondes`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]);
}

export function useWorkouts(selection?: Selection) {
  const { user, profile, loading: authLoading } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    logger.info('[useWorkouts] Début chargement workouts');
    logger.debug('[useWorkouts] Profile role:', profile?.role, 'Selection:', selection, 'AuthLoading:', authLoading);

    // Wait for auth to be initialised
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

    let mainTimerId: string | undefined;
    let groupTimerId: string | undefined;

    try {
      mainTimerId = logger.time('[useWorkouts] Temps total de chargement');
      let query = supabase.from('workouts').select('*');

      if (profile.role === 'coach' && selection) {
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
          const groupQuery = supabase.from('group_members')
            .select('group_id')
            .eq('athlete_id', user.id);
          const { data: groupMemberships, error: groupError } = await withTimeout(groupQuery, 8000, 'Requête group_members');
          logger.timeEnd(groupTimerId);
          if (groupError) {
            logger.warn('[useWorkouts] Erreur group_members:', groupError);
            throw groupError;
          }
          const groupIds = groupMemberships?.map(m => m.group_id) || [];
          logger.info('[useWorkouts] Groupes trouvés:', groupIds.length);
          let filter = `user_id.eq.${user.id},assigned_to_user_id.eq.${user.id}`;
          if (groupIds.length > 0) {
            filter += `,assigned_to_group_id.in.(${groupIds.join(',')})`;
          }
          query = query.or(filter);
        } catch (groupError: any) {
          if (groupTimerId) logger.timeEnd(groupTimerId);
          logger.warn('[useWorkouts] Erreur lors de la récupération des groupes, chargement uniquement des séances utilisateur:', groupError);
          query = query.or(`user_id.eq.${user.id},assigned_to_user_id.eq.${user.id}`);
        }
      }

      logger.info('[useWorkouts] Exécution de la requête workouts...');
      const workoutsQuery = query.order('date', { ascending: false });
      const { data, error } = await withTimeout(workoutsQuery, 10000, 'Requête workouts');
      logger.timeEnd(mainTimerId);
      if (error) {
        logger.error('[useWorkouts] Erreur Supabase:', error);
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

  // planWorkout, completeWorkout, updateWorkout, deleteWorkout and createCompletedWorkout
  // remain identiques à la version actuelle de votre code.
  // … (vous pouvez conserver ces fonctions telles quelles)
}
