import { useState, useEffect, useRef } from 'react'
import useAuth from './useAuth.ts'
import { useProfile } from './useProfile.ts'
import { supabase } from '../lib/supabase'

interface GroupChatMessage {
  id: string
  group_id: string
  user_id: string
  message: string
  is_system: boolean
  created_at: string
  user_name: string
  user_photo?: string
  is_coach: boolean
}

interface TypingUser {
  user_id: string
  user_name: string
  timestamp: number
}

export function useGroupChat(groupId: string | null) {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [messages, setMessages] = useState<GroupChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)

  // Nettoyer les utilisateurs qui tapent (timeout après 3 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setTypingUsers(prev => prev.filter(user => now - user.timestamp < 3000))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (groupId && user) {
      loadMessages()
      setupRealtimeSubscription()
    } else {
      setMessages([])
      setLoading(false)
      cleanupSubscription()
    }
    
    return () => cleanupSubscription()
  }, [groupId, user])

  const setupRealtimeSubscription = () => {
    if (!groupId || !user) return
    
    console.log('🔄 Configuration temps réel pour groupe:', groupId)
    console.log('🔄 User ID:', user.id)
    console.log('🔄 Supabase configuré:', import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co')
    
    // Nettoyer l'ancienne souscription
    cleanupSubscription()
    
    // Écouter les nouveaux messages
    const messagesChannel = supabase
      .channel(`group_chat_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_chat_messages',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          console.log('📨 Nouveau message temps réel:', payload.new)
          
          const newMessage: GroupChatMessage = {
            id: payload.new.id,
            group_id: payload.new.group_id,
            user_id: payload.new.user_id,
            message: payload.new.message,
            is_system: payload.new.is_system,
            created_at: payload.new.created_at,
            user_name: payload.new.user_id === user.id 
              ? 'Vous' 
              : (payload.new.user_id === 'demo-coach' ? 'Coach Martin' : 'Utilisateur'),
            is_coach: payload.new.user_id === 'demo-coach' || false
          }
          
          // Ajouter le message seulement s'il n'existe pas déjà
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id)
            if (exists) return prev
            return [...prev, newMessage]
          })
          
          // Notification si l'utilisateur n'est pas l'expéditeur
          if (payload.new.user_id !== user.id) {
            showNotification(newMessage)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Statut souscription messages:', status)
      })
    
    // Écouter les indicateurs de frappe
    const typingChannel = supabase
      .channel(`typing_${groupId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        console.log('⌨️ Indicateur frappe reçu:', payload)
        
        if (payload.payload.user_id !== user.id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.user_id !== payload.payload.user_id)
            return [...filtered, {
              user_id: payload.payload.user_id,
              user_name: payload.payload.user_name,
              timestamp: Date.now()
            }]
          })
        }
      })
      .on('broadcast', { event: 'stop_typing' }, (payload) => {
        console.log('⏹️ Arrêt frappe reçu:', payload)
        
        setTypingUsers(prev => prev.filter(u => u.user_id !== payload.payload.user_id))
      })
      .subscribe((status) => {
        console.log('📡 Statut souscription frappe:', status)
      })
    
    channelRef.current = { messagesChannel, typingChannel }
  }

  const cleanupSubscription = () => {
    if (channelRef.current) {
      console.log('🧹 Nettoyage souscriptions temps réel')
      channelRef.current.messagesChannel?.unsubscribe()
      channelRef.current.typingChannel?.unsubscribe()
      channelRef.current = null
    }
  }

  const showNotification = (message: GroupChatMessage) => {
    // Vérifier si les notifications sont supportées et autorisées
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`💬 ${message.user_name}`, {
          body: message.message,
          icon: '/PhotoRoom-20250915_123950.png',
          tag: `group_${groupId}`,
          requireInteraction: false
        })
      } else if (Notification.permission === 'default') {
        // Demander la permission
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(`💬 ${message.user_name}`, {
              body: message.message,
              icon: '/PhotoRoom-20250915_123950.png',
              tag: `group_${groupId}`
            })
          }
        })
      }
    }
    
    // Notification visuelle dans l'app
    const notificationDiv = document.createElement('div')
    notificationDiv.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          ${message.user_name[0]}
        </div>
        <div>
          <div class="font-medium text-white">${message.user_name}</div>
          <div class="text-white/90 text-sm">${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}</div>
        </div>
      </div>
    `
    notificationDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #7c6df2, #f97316);
      color: white;
      padding: 16px;
      border-radius: 12px;
      font-weight: 500;
      z-index: 9999;
      box-shadow: 0 8px 25px rgba(124, 109, 242, 0.3);
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `
    
    document.body.appendChild(notificationDiv)
    setTimeout(() => {
      notificationDiv.style.animation = 'slideOut 0.3s ease-in'
      setTimeout(() => notificationDiv.remove(), 300)
    }, 4000)
  }

  const loadMessages = async () => {
    if (!groupId || !user) return
    
    setLoading(true)
    
    try {
      console.log('💬 Chargement messages pour groupe:', groupId)
      
      const { data, error } = await supabase
        .from('group_chat_messages')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            photo_url,
            role
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100)
      
      if (error) {
        console.error('❌ Erreur chargement messages:', error.message)
        setMessages([])
      } else {
        console.log('✅ Messages chargés:', data?.length || 0)
        
        const enrichedMessages: GroupChatMessage[] = data?.map(msg => ({
          id: msg.id,
          group_id: msg.group_id,
          user_id: msg.user_id,
          message: msg.message,
          is_system: msg.is_system,
          created_at: msg.created_at,
          user_name: msg.profiles 
            ? `${msg.profiles.first_name || ''} ${msg.profiles.last_name || ''}`.trim() || 'Utilisateur'
            : (msg.user_id === user.id ? 'Vous' : 'Utilisateur'),
          user_photo: msg.profiles?.photo_url,
          is_coach: msg.profiles?.role === 'coach' || false
        })) || []
        
        setMessages(enrichedMessages)
      }
    } catch (error) {
      console.error('💥 Erreur réseau messages:', error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const sendTypingIndicator = () => {
    if (!groupId || !user || !profile) return
    
    // Envoyer l'indicateur de frappe
    if (channelRef.current?.typingChannel) {
      channelRef.current.typingChannel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: user.id,
          user_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur'
        }
      })
    }
    
    // Programmer l'arrêt automatique après 3 secondes
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTypingIndicator()
    }, 3000)
  }

  const stopTypingIndicator = () => {
    if (!groupId || !user) return
    
    if (channelRef.current?.typingChannel) {
      channelRef.current.typingChannel.send({
        type: 'broadcast',
        event: 'stop_typing',
        payload: {
          user_id: user.id
        }
      })
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }

  const sendMessage = async (messageText: string) => {
    if (!groupId || !user || !messageText.trim()) return
    
    // Arrêter l'indicateur de frappe
    stopTypingIndicator()
    
    // Créer le message local immédiatement
    const localMessage: GroupChatMessage = {
      id: `msg_${Date.now()}`,
      group_id: groupId,
      user_id: user.id,
      message: messageText.trim(),
      is_system: false,
      created_at: new Date().toISOString(),
      user_name: 'Vous',
      user_photo: profile?.photo_url,
      is_coach: profile?.role === 'coach'
    }
    
    // Ajouter immédiatement à l'interface
    setMessages(prev => [...prev, localMessage])
    
    try {
      // Sauvegarder sur Supabase (le temps réel se chargera de la diffusion)
      const { data, error } = await supabase
        .from('group_chat_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          message: messageText.trim(),
          is_system: false
        })
        .select()
        .single()
      
      if (error) {
        console.warn('Erreur envoi message:', error.message)
        return localMessage
      }
      
      // Remplacer le message local par celui de Supabase
      const supabaseMessage: GroupChatMessage = {
        id: data.id,
        group_id: data.group_id,
        user_id: data.user_id,
        message: data.message,
        is_system: data.is_system,
        created_at: data.created_at,
        user_name: localMessage.user_name,
        user_photo: localMessage.user_photo,
        is_coach: localMessage.is_coach
      }
      
      setMessages(prev => 
        prev.map(msg => msg.id === localMessage.id ? supabaseMessage : msg)
      )
      
      return supabaseMessage
      
    } catch (error) {
      console.warn('Erreur envoi message:', error)
      return localMessage
    }
  }

  return {
    messages,
    loading,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    stopTypingIndicator,
    loadMessages
  }
}