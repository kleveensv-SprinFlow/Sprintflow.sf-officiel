import { useState, useEffect } from 'react'
import useAuth from './useAuth'
import { supabase } from '../lib/supabase'
import { Record } from '../types'

export function useRecords(targetUserId?: string) {
  const { user } = useAuth()
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const userId = targetUserId || user?.id

  useEffect(() => {
    if (userId) {
      loadRecords()
    } else {
      setRecords([])
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    const handleRecordSaved = () => {
      if (userId) {
        loadRecords()
      }
    }
    window.addEventListener('record-saved', handleRecordSaved)
    return () => window.removeEventListener('record-saved', handleRecordSaved)
  }, [userId])

  const loadRecords = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
      
      if (error) {
        console.error('Erreur chargement records:', error.message)
        setRecords([])
      } else {
        const mappedRecords: Record[] = data?.map(item => ({
          id: item.id,
          type: item.type,
          name: item.exercise_name,
          value: item.performance,
          unit: item.unit,
          date: item.date,
          exercice_reference_id: item.exercice_reference_id,
          category: item.category
        })) || []
        setRecords(mappedRecords)
        localStorage.setItem(`records_${userId}`, JSON.stringify(mappedRecords))
      }
    } catch (error) {
      console.error('Erreur loadRecords:', error)
      // En cas d'erreur réseau, essayer localStorage
      const localRecords = localStorage.getItem(`records_${userId}`)
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
      weight_kg: record.value,
      reps: 1,
      date: record.date,
      ...(record.exercice_reference_id && { exercice_id: record.exercice_reference_id })
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
        value: parseFloat(data.weight_kg),
        unit: record.unit,
        date: data.date,
        exercice_reference_id: data.exercice_id
      }
      
      setRecords(prev => [completeRecord, ...prev])
      window.dispatchEvent(new Event('record-saved'))

      return completeRecord
      
    } catch (error) {
      console.error('Erreur saveRecord:', error)
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
      window.dispatchEvent(new Event('record-saved'))
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