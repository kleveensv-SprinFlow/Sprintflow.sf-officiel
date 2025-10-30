import { useState, useEffect, useCallback } from 'react'
import useAuth from './useAuth.ts'
import { supabase } from '../lib/supabase'
import { Workout } from '../types'

export function useWorkouts(userId?: string) {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  const effectiveUserId = userId || user?.id;

  const loadWorkouts = useCallback(async () => {
    if (!effectiveUserId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          wellness_log ( rpe_difficulty )
        `)
        .eq('user_id', effectiveUserId)
        .order('date', { ascending: false })

      if (error) {
        console.error('Erreur chargement workouts:', error.message)
        const localWorkouts = localStorage.getItem(`workouts_${effectiveUserId}`)
        if (localWorkouts) {
          setWorkouts(JSON.parse(localWorkouts))
        } else {
          setWorkouts([])
        }
      } else {
        setWorkouts(data as Workout[])
        localStorage.setItem(`workouts_${effectiveUserId}`, JSON.stringify(data))
      }
    } catch (error) {
      console.error('Erreur loadWorkouts:', error)
      const localWorkouts = localStorage.getItem(`workouts_${effectiveUserId}`)
      if (localWorkouts) {
        setWorkouts(JSON.parse(localWorkouts))
      } else {
        setWorkouts([])
      }
    } finally {
      setLoading(false)
    }
  }, [effectiveUserId]);
  
  useEffect(() => {
    loadWorkouts()
  }, [loadWorkouts])

  const saveWorkout = async (workout: Omit<Workout, 'id'>) => {
    if (!user) throw new Error('Utilisateur non connecté')

    const workoutData = {
      ...workout,
      user_id: user.id,
    }

    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert(workoutData)
        .select()
        .single()

      if (error) throw error;
      
      const newWorkout = data as Workout;
      setWorkouts(prev => [newWorkout, ...prev]);
      localStorage.setItem(`workouts_${user.id}`, JSON.stringify([newWorkout, ...workouts]))

      return newWorkout

    } catch (error) {
      console.error('Erreur saveWorkout:', error)
      throw error;
    }
  }

  const updateWorkout = async (id: string, workout: Partial<Workout>) => {
    if (!user) throw new Error('Utilisateur non connecté')

    try {
      const { error } = await supabase
        .from('workouts')
        .update(workout)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error;

      setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...workout } : w))
      localStorage.setItem(`workouts_${user.id}`, JSON.stringify(workouts.map(w => w.id === id ? { ...w, ...workout } : w)))
    } catch (error) {
      console.error('Erreur updateWorkout:', error)
      throw error
    }
  }

  const deleteWorkout = async (id: string) => {
    if (!user) throw new Error('Utilisateur non connecté')

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error;

      setWorkouts(prev => prev.filter(w => w.id !== id))
      localStorage.setItem(`workouts_${user.id}`, JSON.stringify(workouts.filter(w => w.id !== id)))
    } catch (error) {
      console.error('Erreur deleteWorkout:', error)
      throw error
    }
  }

  const assignWorkout = async (workout: Omit<Workout, 'id'>, athleteIds: string[], date: string, notes: string) => {
    if (!user) throw new Error('Coach non connecté');

    const workoutsToInsert = athleteIds.map(athleteId => ({
      ...workout,
      user_id: athleteId,
      date: date,
      notes: notes,
      is_planified: true,
      planned_by_coach_id: user.id,
    }));

    try {
      const { error } = await supabase.from('workouts').insert(workoutsToInsert);
      if (error) throw error;
    } catch (error) {
      console.error('Erreur assignWorkout:', error);
      throw error;
    }
  };

  return {
    workouts,
    loading,
    saveWorkout,
    updateWorkout,
    deleteWorkout,
    assignWorkout,
    loadWorkouts
  }
}
