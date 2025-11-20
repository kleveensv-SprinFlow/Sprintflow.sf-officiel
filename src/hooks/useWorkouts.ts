e') {
          query = query.eq('user_id', selection.id);
        } else if (selection.type === 'group') {
          query = query.eq('assigned_to_group_id', selection.id);
        }
      } else {
        // Mode athlète : on récupère ses groupes + séances
        try {
          const { data: groupMemberships, error: groupError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('athlete_id', user.id);

          if (groupError) {
            logger.warn('⚠️ [useWorkouts] Erreur group_members:', groupError);
            throw groupError;
          }

          const groupIds = groupMemberships?.map((m: any) => m.group_id) || [];
          logger.info('👥 [useWorkouts] Groupes trouvés:', groupIds.length);

          let filter = `user_id.eq.${user.id},assigned_to_user_id.eq.${user.id}`;
          if (groupIds.length > 0) {
            filter += `,assigned_to_group_id.in.(${groupIds.join(',')})`;
          }
          query = query.or(filter);
        } catch (groupError: any) {
          logger.warn(
            '⚠️ [useWorkouts] Erreur groupes, charge uniquement user:',
            groupError
          );
          query = query.or(
            `user_id.eq.${user.id},assigned_to_user_id.eq.${user.id}`
          );
        }
      }

      logger.info('🚀 [useWorkouts] Exécution de la requête...');

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        logger.error('❌ [useWorkouts] Erreur Supabase:', error);
        throw error;
      }

      logger.info('✅ [useWorkouts] Workouts chargés:', data?.length || 0);
      setWorkouts((data as Workout[]) || []);
    } catch (err: any) {
      setError(err?.message || 'Erreur inconnue lors du chargement des séances');
      logger.error('❌ [useWorkouts] Erreur lors du chargement des séances:', err);
      setWorkouts([]);
    } finally {
      setLoading(false);
      logger.info('✅ [useWorkouts] Chargement terminé');
    }
  }, [selection, user, profile, authLoading]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // =========================
  //   Actions coach / athlète
  // =========================

  const planWorkout = async (planning: {
    date: string;
    type: 'guidé' | 'manuscrit' | 'modèle';
    tag_seance?: string;
    notes?: string;
    planned_data?: { blocs: any[] };
    assigned_to_user_id?: string;
    assigned_to_group_id?: string;
  }) => {
    if (!user || profile?.role !== 'coach') {
      throw new Error('Action non autorisée.');
    }

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
      // On assigne au coach par défaut pour garder une référence
      insertData.user_id = user.id;
    }

    const { data, error } = await supabase
      .from('workouts')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setWorkouts(prev =>
        [data as Workout, ...prev].sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
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

    if (data) {
      setWorkouts(prev =>
        prev.map(w => (w.id === plannedWorkoutId ? (data as Workout) : w))
      );
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
      setWorkouts(prev =>
        prev.map(w => (w.id === workoutId ? (data as Workout) : w))
      );
    }

    return data;
  };

  const deleteWorkout = async (workoutId: string) => {
    const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
    if (error) throw error;

    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  };

  const createCompletedWorkout = async (workoutData: {
    tag_seance: string;
    type: 'guidé' | 'manuscrit';
    notes?: string;
    blocs: any[];
  }) => {
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
        planned_data:
          workoutData.type === 'guidé'
            ? { blocs: workoutData.blocs }
            : undefined,
      })
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setWorkouts(prev =>
        [data as Workout, ...prev].sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
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