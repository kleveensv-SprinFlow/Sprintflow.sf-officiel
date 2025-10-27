import { useState, useEffect } from 'react'
import useAuth from './useAuth.ts'
import { supabase } from '../lib/supabase'

interface ChatMessage {
  id: string
  user_id: string
  message: string
  response: string
  plan_type: string
  used_personal_data: boolean
  created_at: string
}

export function useChatMessages() {
  const { user } = useAuth()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadChatMessages()
    } else {
      setChatMessages([])
      setLoading(false)
    }
  }, [user])

  const loadChatMessages = async () => {
    if (!user) return
    
    try {
      console.log('💬 Chargement messages chat Supabase pour:', user.id)
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50) // Limiter aux 50 derniers messages
      
      if (error) {
        console.error('❌ Erreur chargement messages:', error.message)
        setChatMessages([])
      } else {
        console.log('✅ Messages chargés:', data?.length || 0)
        setChatMessages(data || [])
      }
    } catch (error) {
      console.error('💥 Erreur loadChatMessages:', error)
      setChatMessages([])
    } finally {
      setLoading(false)
    }
  }

  const saveChatMessage = async (messageData: {
    message: string
    response: string
    plan_type: string
    used_personal_data: boolean
  }) => {
    if (!user) throw new Error('Utilisateur non connecté')
    
    try {
      console.log('💾 Sauvegarde message chat:', messageData)
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          ...messageData
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Erreur sauvegarde message:', error.message)
        throw error
      }
      
      console.log('✅ Message sauvegardé:', data)
      setChatMessages(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('💥 Erreur saveChatMessage:', error)
      throw error
    }
  }

  return {
    chatMessages,
    loading,
    saveChatMessage,
    loadChatMessages
  }
}