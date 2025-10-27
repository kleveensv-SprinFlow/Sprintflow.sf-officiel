import { useState, useEffect } from 'react'
import useAuth from './useAuth.ts'
import { supabase } from '../lib/supabase'
import { BodyComposition } from '../types'

export function useBodyComposition() {
  const { user } = useAuth()
  const [bodyComps, setBodyComps] = useState<BodyComposition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBodyCompositions()
    } else {
      setBodyComps([])
      setLoading(false)
    }
  }, [user])

  const loadBodyCompositions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('donnees_corporelles')
        .select('*')
        .eq('athlete_id', user.id)
        .order('date', { ascending: false })
      
      if (error) {
        console.warn('Erreur chargement body compositions, utilisation cache local:', error.message)
        // En cas d'erreur Supabase, essayer localStorage comme fallback
        const localBodyComps = localStorage.getItem(`bodycomps_${user.id}`)
        if (localBodyComps) {
          try {
            const parsedBodyComps = JSON.parse(localBodyComps)
            setBodyComps(parsedBodyComps)
          } catch (parseError) {
            console.warn('Erreur parsing body compositions locales:', parseError)
            setBodyComps([])
          }
        } else {
          setBodyComps([])
        }
      } else {
        const mappedData = data?.map(item => ({
          id: item.id,
          date: item.date,
          weight: item.poids_kg || 0,
          height: 180,
          waterPercentage: 60,
          totalMuscle: item.masse_musculaire_kg || 0,
          skeletalMuscle: item.muscle_squelettique_kg || 0,
          bodyFatPercentage: item.masse_grasse_pct || 0
        })) || []
        setBodyComps(mappedData)
        
        // Synchroniser avec localStorage après chargement Supabase
        localStorage.setItem(`bodycomps_${user.id}`, JSON.stringify(mappedData))
      }
    } catch (error) {
      console.warn('Erreur réseau body compositions, utilisation cache local:', error)
      // En cas d'erreur réseau, essayer localStorage
      const localBodyComps = localStorage.getItem(`bodycomps_${user.id}`)
      if (localBodyComps) {
        try {
          const parsedBodyComps = JSON.parse(localBodyComps)
          setBodyComps(parsedBodyComps)
        } catch (parseError) {
          setBodyComps([])
        }
      } else {
        setBodyComps([])
      }
    } finally {
      setLoading(false)
    }
  }

  const saveBodyComposition = async (bodyComp: any) => {
    if (!user) throw new Error('Utilisateur non connecté')

    const { data: latestNutrition } = await supabase
      .from('donnees_corporelles')
      .select('poids_kg')
      .eq('athlete_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const bodyCompData = {
      athlete_id: user.id,
      date: bodyComp.date,
      poids_kg: latestNutrition?.poids_kg || null,
      masse_grasse_pct: bodyComp.masse_grasse_pct,
      masse_musculaire_kg: bodyComp.masse_musculaire_kg || null,
      muscle_squelettique_kg: bodyComp.muscle_squelettique_kg || null,
    }

    try {
      const { data, error } = await supabase
        .from('donnees_corporelles')
        .insert(bodyCompData)
        .select()
        .single()
      
      if (error) {
        console.error('Erreur sauvegarde body composition:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('Aucune donnée retournée par Supabase')
      }
      
      const mappedData: BodyComposition = {
        id: data.id,
        date: data.date,
        weight: data.poids_kg || 0,
        height: 180,
        waterPercentage: 60,
        totalMuscle: data.masse_musculaire_kg || 0,
        skeletalMuscle: data.muscle_squelettique_kg || 0,
        bodyFatPercentage: data.masse_grasse_pct || 0
      }
      
      // Mettre à jour l'état local
      setBodyComps(prev => [mappedData, ...prev])
      
      // Synchroniser avec localStorage
      const updatedBodyComps = [mappedData, ...bodyComps]
      localStorage.setItem(`bodycomps_${user.id}`, JSON.stringify(updatedBodyComps))
      
      return mappedData
      
    } catch (error: any) {
      console.error('Erreur saveBodyComposition:', error)
      throw new Error(`Erreur sauvegarde: ${error.message || error}`)
    }
  }

  const deleteBodyComposition = async (id: string) => {
    if (!user) throw new Error('Utilisateur non connecté')

    try {
      const { error } = await supabase
        .from('donnees_corporelles')
        .delete()
        .eq('id', id)
        .eq('athlete_id', user.id)
      
      if (error) {
        console.error('Erreur suppression body composition:', error.message)
        throw error
      }
      
      setBodyComps(prev => prev.filter(b => b.id !== id))
      
      // Mettre à jour localStorage après suppression
      const updatedBodyComps = bodyComps.filter(b => b.id !== id)
      localStorage.setItem(`bodycomps_${user.id}`, JSON.stringify(updatedBodyComps))
    } catch (error) {
      console.error('Erreur deleteBodyComposition:', error)
      throw error
    }
  }

  return {
    bodyComps,
    loading,
    saveBodyComposition,
    deleteBodyComposition,
    loadBodyCompositions
  }
}