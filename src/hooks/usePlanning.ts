import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, subWeeks, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import useAuth from './useAuth.ts'
import { supabase } from '../lib/supabase'
import { SessionTemplate } from '../types'

interface WeeklyPlan {
  id: string
  coach_id: string
  athlete_id: string
  week_start_date: string
  title: string
  notes?: string
  created_at: string
}

interface DailySession {
  id: string
  weekly_plan_id: string
  date: string
  title: string
  notes?: string
  completed: boolean
  created_at: string
}

interface SessionExercise {
  id: string
  daily_session_id: string
  exercise_name: string
  sets?: number
  reps?: string
  rest_seconds?: number
  notes?: string
  order_index: number
  created_at: string
}

interface Exercise {
  id: string
  type: 'strength' | 'cardio'
  name: string
  sets?: number
  reps?: string
  weight?: number
  rest_seconds?: number
  distances?: number[]
  intensity_level?: 'low' | 'medium' | 'high'
  notes?: string
}

export function usePlanning() {
  const { user, profile } = useAuth()
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null)
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([])
  const [dailySessions, setDailySessions] = useState<DailySession[]>([])
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([])
  const [sessionTemplates, setSessionTemplates] = useState<SessionTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'coach') {
        if (currentGroupId) {
          loadSessionTemplatesForGroup(currentGroupId)
        } else {
          // Vider les templates si aucun groupe sélectionné
          setSessionTemplates([])
          setLoading(false)
        }
      } else {
        loadAthletePlanning()
      }
    } else {
      setWeeklyPlans([])
      setDailySessions([])
      setSessionExercises([])
      setSessionTemplates([])
      setLoading(false)
    }
  }, [user, profile, currentGroupId])

  const loadSessionTemplatesForGroup = async (groupId: string) => {
    if (!user || !profile || profile.role !== 'coach') return
    
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('session_templates')
        .select('*')
        .eq('coach_id', user.id)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Erreur chargement session templates:', error.message)
        setSessionTemplates([])
      } else {
        setSessionTemplates(data || [])
      }
      
    } catch (error) {
      console.error('Erreur loadSessionTemplatesForGroup:', error)
      setSessionTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const loadAthletePlanning = async () => {
    if (!user || !profile || profile.role !== 'athlete') return
    
    // Pour l'instant, on ne fait rien ici car le chargement se fait via loadAthleteGroupPlanning
    // appelé depuis AthletePlanning.tsx
    setLoading(false)
  }

  const createSessionTemplate = async (templateData: Omit<SessionTemplate, 'id' | 'coach_id' | 'updated_at'> & { group_id: string }) => {
    if (!user || !profile) throw new Error('Utilisateur non connecté')
    if (profile.role !== 'coach' && profile.role !== 'developer') throw new Error('Seuls les coachs peuvent créer des modèles')
    if (!templateData.group_id) throw new Error('Un groupe doit être sélectionné')
    
    try {
      const { data, error } = await supabase
        .from('session_templates')
        .insert({
          ...templateData,
          coach_id: user.id,
          group_id: templateData.group_id
        })
        .select()
        .single()
      
      if (error) {
        console.error('Erreur création template:', error.message)
        throw error
      }
      
      // Ajouter seulement si c'est pour le groupe actuellement sélectionné
      if (data.group_id === currentGroupId) {
        setSessionTemplates(prev => [data, ...prev])
      }
      
      return data
    } catch (error) {
      console.error('Erreur createSessionTemplate:', error)
      throw error
    }
  }

  const updateSessionTemplate = async (templateId: string, templateData: Partial<SessionTemplate>) => {
    if (!user || !profile) throw new Error('Utilisateur non connecté')
    if (profile.role !== 'coach' && profile.role !== 'developer') throw new Error('Seuls les coachs peuvent modifier des modèles')
    if (!currentGroupId) throw new Error('Aucun groupe sélectionné')
    
    try {
      const { data, error } = await supabase
        .from('session_templates')
        .update({
          ...templateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .eq('coach_id', user.id)
        .eq('group_id', currentGroupId)
        .select()
        .single()
      
      if (error) {
        console.error('Erreur modification template:', error.message)
        throw error
      }
      
      // Mettre à jour l'état local
      setSessionTemplates(prev => 
        prev.map(template => 
          template.id === templateId ? data : template
        )
      )
      
      return data
    } catch (error) {
      console.error('Erreur updateSessionTemplate:', error)
      throw error
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!user || !profile) throw new Error('Utilisateur non connecté')
    if (!currentGroupId) throw new Error('Aucun groupe sélectionné')
    
    try {
      // Supprimer immédiatement de l'état local
      setSessionTemplates(prev => {
        const filtered = prev.filter(s => s.id !== sessionId)
        return filtered
      })
      
      // Supprimer de Supabase avec vérification du groupe
      const { error } = await supabase
        .from('session_templates')
        .delete()
        .eq('id', sessionId)
        .eq('coach_id', user.id)
        .eq('group_id', currentGroupId)
      
      if (error) {
        console.error('Erreur suppression séance:', error.message)
        // Recharger en cas d'erreur pour remettre l'état correct
        loadSessionTemplatesForGroup(currentGroupId)
        throw error
      }
      
    } catch (error) {
      console.error('Erreur deleteSession:', error)
      throw error
    }
  }

  const setSelectedGroup = (groupId: string | null) => {
    setCurrentGroupId(groupId)
    
    // Vider immédiatement les templates pour éviter l'affichage de mauvaises données
    setSessionTemplates([])
    
    if (groupId && profile?.role === 'coach') {
      // Charger les templates pour le nouveau groupe
      loadSessionTemplatesForGroup(groupId)
    }
  }

  const loadAthleteGroupPlanning = async (groupId: string) => {
    if (!user || !profile || profile.role !== 'athlete') return
    
    setLoading(true)
    try {
      console.log('📚 Chargement planning athlète pour groupe:', groupId)
      
      const { data: templates, error } = await supabase
        .from('session_templates')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Erreur chargement planning athlète:', error.message)
        setSessionTemplates([])
      } else {
        console.log('✅ Templates chargés:', templates?.length || 0)
        setSessionTemplates(templates || [])
      }
    } catch (error) {
      console.error('Erreur réseau planning athlète:', error)
      setSessionTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const copyPreviousWeek = async (currentWeekStart: string) => {
    if (!user || !profile) throw new Error('Utilisateur non connecté')
    if (profile.role !== 'coach') throw new Error('Seuls les coachs peuvent copier des semaines')
    if (!currentGroupId) throw new Error('Aucun groupe sélectionné')
    
    try {
      // Calculer la date de début de la semaine précédente
      const currentWeekDate = parseISO(currentWeekStart)
      const previousWeekDate = subWeeks(currentWeekDate, 1)
      const previousWeekStart = format(previousWeekDate, 'yyyy-MM-dd')
      
      console.log('📅 Copie semaine:', {
        currentWeek: currentWeekStart,
        previousWeek: previousWeekStart,
        groupId: currentGroupId
      })
      
      // Récupérer les templates de la semaine précédente
      const { data: previousTemplates, error } = await supabase
        .from('session_templates')
        .select('*')
        .eq('coach_id', user.id)
        .eq('group_id', currentGroupId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Erreur récupération templates précédents:', error.message)
        throw new Error('Erreur lors de la récupération des séances précédentes')
      }
      
      if (!previousTemplates || previousTemplates.length === 0) {
        throw new Error('Aucune séance trouvée pour ce groupe')
      }
      
      console.log('📋 Templates trouvés:', previousTemplates.length)
      
      // Créer les nouveaux templates pour la semaine courante
      const newTemplates = previousTemplates.map(template => ({
        name: `${template.name} (Copie)`,
        description: template.description,
        session_type: template.session_type,
        duration_minutes: template.duration_minutes,
        intensity: template.intensity,
        exercises: template.exercises,
        group_id: currentGroupId,
        coach_id: user.id,
        created_at: new Date().toISOString()
      }))
      
      // Insérer les nouveaux templates
      const { data: createdTemplates, error: insertError } = await supabase
        .from('session_templates')
        .insert(newTemplates)
        .select()
      
      if (insertError) {
        console.error('Erreur création nouveaux templates:', insertError.message)
        throw new Error('Erreur lors de la création des nouvelles séances')
      }
      
      console.log('✅ Nouveaux templates créés:', createdTemplates?.length || 0)
      
      // Mettre à jour l'état local
      if (createdTemplates && createdTemplates.length > 0) {
        setSessionTemplates(prev => [...createdTemplates, ...prev])
      }
      
      return createdTemplates
      
    } catch (error) {
      console.error('Erreur copyPreviousWeek:', error)
      throw error
    }
  }

  const markSessionAsCompleted = async (sessionId: string, completed: boolean) => {
    if (!user) throw new Error('Utilisateur non connecté')

    try {
      // Mettre à jour l'état local immédiatement pour une meilleure réactivité
      setSessionTemplates(prev =>
        prev.map(session =>
          session.id === sessionId ? { ...session, completed } : session
        )
      )

      // Mettre à jour la base de données
      const { data, error } = await supabase
        .from('session_templates')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single()

      if (error) {
        console.error('Erreur mise à jour séance:', error.message)
        // Revenir à l'état précédent en cas d'erreur
        setSessionTemplates(prev =>
          prev.map(session =>
            session.id === sessionId ? { ...session, completed: !completed } : session
          )
        )
        throw error
      }

      return data
    } catch (error) {
      console.error('Erreur markSessionAsCompleted:', error)
      throw error
    }
  }

  return {
    weeklyPlans,
    dailySessions,
    sessionExercises,
    sessionTemplates,
    selectedGroupId: currentGroupId,
    loading,
    createSessionTemplate,
    updateSessionTemplate,
    deleteSession,
    copyPreviousWeek,
    setSelectedGroup,
    loadAthleteGroupPlanning,
    loadSessionTemplatesForGroup,
    loadAthletePlanning,
    setSessionTemplates,
    markSessionAsCompleted
  }
}