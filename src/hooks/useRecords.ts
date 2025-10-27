import { useState, useEffect } from 'react'
import useAuth from './useAuth.ts'
import { supabase } from '../lib/supabase'
import { Record } from '../types'

export function useRecords() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadRecords()
    } else {
      setRecords([])
      setLoading(false)
    }
  }, [user])

  const loadRecords = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      
      if (error) {
        console.error('Erreur chargement records:', error.message)
        // En cas d'erreur Supabase, essayer localStorage comme fallback
        const localRecords = localStorage.getItem(`records_${user.id}`)
        if (localRecords) {
          try {
            const parsedRecords = JSON.parse(localRecords)
            setRecords(parsedRecords)
          } catch (parseError) {
            console.error('Erreur parsing records locaux:', parseError)
            setRecords([])
          }
        } else {
          setRecords([])
        }
      } else {
        const mappedRecords = data?.map(item => ({
          id: item.id,
          type: (item.exercise_name.includes('m') &&
                 !item.exercise_name.toLowerCase().includes('saut') &&
                 !item.exercise_name.toLowerCase().includes('lancer') &&
                 !item.exercise_name.toLowerCase().includes('poids') &&
                 !item.exercise_name.toLowerCase().includes('disque') &&
                 !item.exercise_name.toLowerCase().includes('javelot') &&
                 !item.exercise_name.toLowerCase().includes('marteau')) ? 'run' as const :
                item.exercise_name.toLowerCase().includes('saut') ? 'jump' as const :
                item.exercise_name.toLowerCase().includes('lancer') ? 'throw' as const : 'exercise' as const,
          name: item.exercise_name,
          value: item.value,
          unit: (item.exercise_name.includes('m') &&
                 !item.exercise_name.toLowerCase().includes('saut') &&
                 !item.exercise_name.toLowerCase().includes('lancer') &&
                 !item.exercise_name.toLowerCase().includes('poids') &&
                 !item.exercise_name.toLowerCase().includes('disque') &&
                 !item.exercise_name.toLowerCase().includes('javelot') &&
                 !item.exercise_name.toLowerCase().includes('marteau')) ? 's' :
                (item.exercise_name.toLowerCase().includes('saut') ||
                 item.exercise_name.toLowerCase().includes('lancer')) ? 'm' : 'kg',
          date: item.date,
          // Récupérer le shoe_type depuis Supabase si disponible
          ...(item.shoe_type && { shoe_type: item.shoe_type })
        })) || []
        setRecords(mappedRecords)
        
        // Synchroniser avec localStorage après chargement Supabase
        localStorage.setItem(`records_${user.id}`, JSON.stringify(mappedRecords))
      }
    } catch (error) {
      console.error('Erreur loadRecords:', error)
      // En cas d'erreur réseau, essayer localStorage
      const localRecords = localStorage.getItem(`records_${user.id}`)
      if (localRecords) {
        try {
          const parsedRecords = JSON.parse(localRecords)
          setRecords(parsedRecords)
        } catch (parseError) {
          setRecords([])
        }
      } else {
        setRecords([])
      }
    } finally {
      setLoading(false)
    }
  }

  const saveRecord = async (record: Omit<Record, 'id'>) => {
    if (!user) throw new Error('Utilisateur non connecté')

    const recordData = {
      user_id: user.id,
      exercise_name: record.name,
      value: record.value,
      date: record.date,
      ...(record.shoe_type && { shoe_type: record.shoe_type }),
      ...(record.exercice_id && { exercice_id: record.exercice_id })
    }
    
    try {
      const { data, error } = await supabase
        .from('records')
        .insert(recordData)
        .select()
        .single()
      
      if (error) {
        console.error('Erreur sauvegarde record:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('Aucune donnée retournée par Supabase')
      }
      
      // Mapper les données Supabase vers le format local
      const completeRecord: Record = {
        id: data.id,
        type: record.type,
        name: data.exercise_name,
        value: parseFloat(data.value),
        unit: record.unit,
        date: data.date,
        // Garder les métadonnées dans l'état local seulement
        ...(record.timing_method && { timing_method: record.timing_method }),
        ...(record.distance_method && { distance_method: record.distance_method }),
        ...(record.wind_speed !== undefined && { wind_speed: record.wind_speed }),
        ...(record.shoe_type && { shoe_type: record.shoe_type }),
        ...(record.is_hill !== undefined && { is_hill: record.is_hill }),
        ...(record.hill_location && { hill_location: record.hill_location })
      }
      
      // Mettre à jour l'état local
      setRecords(prev => [completeRecord, ...prev])
      
      // Synchroniser avec localStorage
      const updatedRecords = [completeRecord, ...records]
      localStorage.setItem(`records_${user.id}`, JSON.stringify(updatedRecords))
      
      return completeRecord
      
    } catch (error) {
      console.error('Erreur saveRecord:', error)
      const localRecord: Record = { 
        ...record, 
        id: `record_${Date.now()}`
      }
      
      setRecords(prev => [localRecord, ...prev])
      
      // Sauvegarder en localStorage
      const updatedRecords = [localRecord, ...records]
      localStorage.setItem(`records_${user.id}`, JSON.stringify(updatedRecords))
      
      // Re-lancer l'erreur pour informer l'utilisateur
      throw new Error(`Erreur sauvegarde: ${error.message || error}`)
    }
  }

  const deleteRecord = async (id: string) => {
    if (!user) throw new Error('Utilisateur non connecté')
    
    try {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Erreur suppression record:', error.message)
        throw error
      }
      
      setRecords(prev => prev.filter(r => r.id !== id))
      
      // Mettre à jour localStorage après suppression
      const updatedRecords = records.filter(r => r.id !== id)
      localStorage.setItem(`records_${user.id}`, JSON.stringify(updatedRecords))
    } catch (error) {
      console.error('Erreur deleteRecord:', error)
      throw error
    }
  }

  return {
    records,
    loading,
    saveRecord,
    deleteRecord,
    loadRecords
  }
}