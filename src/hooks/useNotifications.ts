import { useState, useEffect } from 'react'
import useAuth from './useAuth'
import { supabase } from '../lib/supabase'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder'
  is_read: boolean
  action_url?: string
  action_label?: string
  related_entity_type?: string
  related_entity_id?: string
  created_at: string
  expires_at?: string
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return
    
    try {
      console.log('🔔 Chargement notifications Supabase pour:', user.id)
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) {
        console.error('❌ Erreur chargement notifications:', error.message)
        setNotifications([])
        setUnreadCount(0)
      } else {
        console.log('✅ Notifications chargées:', data?.length || 0)
        setNotifications(data || [])
        setUnreadCount(data?.filter(n => !n.is_read).length || 0)
      }
    } catch (error) {
      console.error('💥 Erreur loadNotifications:', error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!user) return
    
    try {
      console.log('✅ Marquer comme lu:', notificationId)
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('❌ Erreur marquer comme lu:', error.message)
        throw error
      }
      
      console.log('✅ Notification marquée comme lue')
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('💥 Erreur markAsRead:', error)
      throw error
    }
  }

  const createNotification = async (notificationData: {
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error' | 'reminder'
    action_url?: string
    action_label?: string
    related_entity_type?: string
    related_entity_id?: string
    expires_at?: string
  }) => {
    if (!user) throw new Error('Utilisateur non connecté')
    
    try {
      console.log('🔔 Création notification:', notificationData)
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          ...notificationData
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Erreur création notification:', error.message)
        throw error
      }
      
      console.log('✅ Notification créée:', data)
      setNotifications(prev => [data, ...prev])
      setUnreadCount(prev => prev + 1)
      return data
    } catch (error) {
      console.error('💥 Erreur createNotification:', error)
      throw error
    }
  }

  const sendGlobalNotification = async (notificationData: {
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error' | 'reminder'
    action_url?: string
    action_label?: string
  }) => {
    if (!user) throw new Error('Utilisateur non connecté')
    if (user.id !== '75a17559-b45b-4dd1-883b-ce8ccfe03f0f') throw new Error('Accès non autorisé - Développeur uniquement')
    
    try {
      console.log('📢 Envoi notification globale:', notificationData)
      
      // Récupérer tous les IDs des athlètes
      const { data: athletes, error: athletesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'athlete')
      
      if (athletesError) {
        console.error('❌ Erreur récupération athlètes:', athletesError.message)
        throw athletesError
      }
      
      console.log('👥 Athlètes trouvés:', athletes?.length || 0)
      
      if (!athletes || athletes.length === 0) {
        throw new Error('Aucun athlète trouvé')
      }
      
      // Créer une notification pour chaque athlète
      const notificationsToInsert = athletes.map(athlete => ({
        user_id: athlete.id,
        ...notificationData
      }))
      
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationsToInsert)
        .select()
      
      if (error) {
        console.error('❌ Erreur création notifications globales:', error.message)
        throw error
      }
      
      console.log('✅ Notifications globales créées:', data?.length || 0)
      
      // Déclencher un événement pour afficher la notification visuelle
      window.dispatchEvent(new CustomEvent('global-notification', {
        detail: {
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type
        }
      }))
      
      return data
    } catch (error) {
      console.error('💥 Erreur sendGlobalNotification:', error)
      throw error
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    createNotification,
    loadNotifications,
    sendGlobalNotification
  }
}