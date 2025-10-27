import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import useAuth from './useAuth.ts'
import { supabase } from '../lib/supabase'
import { Workout } from '../types'

export function useWorkouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadWorkouts()
    } else {
      setWorkouts([])
      setLoading(false)
    }
  }, [user])

  const loadWorkouts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('Erreur chargement workouts:', error.message)
        const localWorkouts = localStorage.getItem(`workouts_${user.id}`)
        if (localWorkouts) {
          try {
            const parsedWorkouts = JSON.parse(localWorkouts)
            setWorkouts(parsedWorkouts)
          } catch (parseError) {
            console.error('Erreur parsing workouts locaux:', parseError)
            setWorkouts([])
          }
        } else {
          setWorkouts([])
        }
      } else {
        const mappedWorkouts = (data || []).map(workout => {
          const mapped: Workout = {
            id: workout.id,
            user_id: workout.user_id,
            date: workout.date,
            title: workout.title,
            tag_seance: workout.tag_seance,
            courses_json: workout.courses_json || [],
            muscu_json: workout.muscu_json || [],
            sauts_json: workout.sauts_json || [],
            lancers_json: workout.lancers_json || [],
            autres_activites: workout.autres_activites,
            echelle_effort: workout.echelle_effort,
            notes: workout.notes,
            meteo: workout.meteo,
            temperature: workout.temperature,
            duration_minutes: workout.duration_minutes,
            created_at: workout.created_at,
            updated_at: workout.updated_at,
            runs: workout.runs ? (typeof workout.runs === 'string' ? JSON.parse(workout.runs) : workout.runs) : [],
            jumps: workout.jumps ? (typeof workout.jumps === 'string' ? JSON.parse(workout.jumps) : workout.jumps) : [],
            throws: workout.throws ? (typeof workout.throws === 'string' ? JSON.parse(workout.throws) : workout.throws) : [],
            stairs: workout.stairs ? (typeof workout.stairs === 'string' ? JSON.parse(workout.stairs) : workout.stairs) : [],
            exercises: workout.exercises ? (typeof workout.exercises === 'string' ? JSON.parse(workout.exercises) : workout.exercises) : [],
          }
          return mapped
        })
        setWorkouts(mappedWorkouts)

        localStorage.setItem(`workouts_${user.id}`, JSON.stringify(mappedWorkouts))
      }
    } catch (error) {
      console.error('Erreur loadWorkouts:', error)
      const localWorkouts = localStorage.getItem(`workouts_${user.id}`)
      if (localWorkouts) {
        try {
          const parsedWorkouts = JSON.parse(localWorkouts)
          setWorkouts(parsedWorkouts)
        } catch (parseError) {
          setWorkouts([])
        }
      } else {
        setWorkouts([])
      }
    } finally {
      setLoading(false)
    }
  }

  const saveWorkout = async (workout: Omit<Workout, 'id'>) => {
    console.log('🔵 useWorkouts.saveWorkout appelé', { user: user?.id, workout })
    if (!user) throw new Error('Utilisateur non connecté')

    const workoutData = {
      user_id: user.id,
      date: workout.date,
      title: workout.title || `Séance ${workout.tag_seance} - ${workout.date}`,
      tag_seance: workout.tag_seance,
      courses_json: workout.courses_json || [],
      muscu_json: workout.muscu_json || [],
      sauts_json: workout.sauts_json || [],
      lancers_json: workout.lancers_json || [],
      autres_activites: workout.autres_activites,
      echelle_effort: workout.echelle_effort,
      notes: workout.notes,
      meteo: workout.meteo,
      temperature: workout.temperature,
      duration_minutes: workout.duration_minutes || 60,
      runs: JSON.stringify(workout.runs || []),
      jumps: JSON.stringify(workout.jumps || []),
      throws: JSON.stringify(workout.throws || []),
      stairs: JSON.stringify(workout.stairs || []),
      exercises: JSON.stringify(workout.exercises || [])
    }

    try {
      console.log('📤 Envoi à Supabase...', workoutData)
      const { data, error } = await supabase
        .from('workouts')
        .insert(workoutData)
        .select()
        .single()

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        throw error
      }

      if (!data) {
        console.error('❌ Aucune donnée retournée')
        throw new Error('Aucune donnée retournée par Supabase')
      }

      console.log('✅ Données reçues de Supabase:', data)

      const completeWorkout: Workout = {
        id: data.id,
        user_id: data.user_id,
        date: data.date,
        title: data.title,
        tag_seance: data.tag_seance,
        courses_json: workout.courses_json || [],
        muscu_json: workout.muscu_json || [],
        sauts_json: workout.sauts_json || [],
        lancers_json: workout.lancers_json || [],
        autres_activites: data.autres_activites,
        echelle_effort: data.echelle_effort,
        notes: data.notes,
        meteo: data.meteo,
        temperature: data.temperature,
        duration_minutes: data.duration_minutes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        runs: workout.runs || [],
        jumps: workout.jumps || [],
        throws: workout.throws || [],
        stairs: workout.stairs || [],
        exercises: workout.exercises || []
      }

      setWorkouts(prev => {
        const updated = [completeWorkout, ...prev]
        console.log('🔄 État workouts mis à jour:', updated.length, 'séances')
        return updated
      })

      const updatedWorkouts = [completeWorkout, ...workouts]
      localStorage.setItem(`workouts_${user.id}`, JSON.stringify(updatedWorkouts))

      console.log('✅ Sauvegarde complète réussie!')
      return completeWorkout

    } catch (error: any) {
      console.error('Erreur saveWorkout:', error)
      const localWorkout: Workout = {
        id: `workout_${Date.now()}`,
        user_id: user.id,
        date: workout.date,
        title: workout.title,
        tag_seance: workout.tag_seance,
        courses_json: workout.courses_json || [],
        muscu_json: workout.muscu_json || [],
        autres_activites: workout.autres_activites,
        echelle_effort: workout.echelle_effort,
        notes: workout.notes,
        meteo: workout.meteo,
        temperature: workout.temperature,
        duration_minutes: workout.duration_minutes,
        runs: workout.runs || [],
        jumps: workout.jumps || [],
        throws: workout.throws || [],
        stairs: workout.stairs || [],
        exercises: workout.exercises || []
      }

      setWorkouts(prev => [localWorkout, ...prev])

      const updatedWorkouts = [localWorkout, ...workouts]
      localStorage.setItem(`workouts_${user.id}`, JSON.stringify(updatedWorkouts))

      throw new Error(`Erreur sauvegarde: ${error.message || error}`)
    }
  }

  const updateWorkout = async (id: string, workout: Partial<Workout>) => {
    if (!user) throw new Error('Utilisateur non connecté')

    const updateData: any = {
      date: workout.date,
      title: workout.title,
      tag_seance: workout.tag_seance,
      courses_json: workout.courses_json,
      muscu_json: workout.muscu_json,
      sauts_json: workout.sauts_json,
      lancers_json: workout.lancers_json,
      autres_activites: workout.autres_activites,
      echelle_effort: workout.echelle_effort,
      notes: workout.notes,
      meteo: workout.meteo,
      temperature: workout.temperature,
      duration_minutes: workout.duration_minutes,
      updated_at: new Date().toISOString()
    }

    if (workout.runs) updateData.runs = JSON.stringify(workout.runs)
    if (workout.jumps) updateData.jumps = JSON.stringify(workout.jumps)
    if (workout.throws) updateData.throws = JSON.stringify(workout.throws)
    if (workout.stairs) updateData.stairs = JSON.stringify(workout.stairs)
    if (workout.exercises) updateData.exercises = JSON.stringify(workout.exercises)

    try {
      const { error } = await supabase
        .from('workouts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erreur mise à jour workout:', error.message)
        throw error
      }

      setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...workout } : w))

      const updatedWorkouts = workouts.map(w => w.id === id ? { ...w, ...workout } : w)
      localStorage.setItem(`workouts_${user.id}`, JSON.stringify(updatedWorkouts))
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

      if (error) {
        console.error('Erreur suppression workout:', error.message)
        throw error
      }

      setWorkouts(prev => prev.filter(w => w.id !== id))

      const updatedWorkouts = workouts.filter(w => w.id !== id)
      localStorage.setItem(`workouts_${user.id}`, JSON.stringify(updatedWorkouts))
    } catch (error) {
      console.error('Erreur deleteWorkout:', error)
      throw error
    }
  }

  return {
    workouts,
    loading,
    saveWorkout,
    updateWorkout,
    deleteWorkout,
    loadWorkouts
  }
}
