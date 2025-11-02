import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';

export interface IndividualChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender_name: string;
  sender_photo?: string;
}

export const useIndividualChat = (partnerId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<IndividualChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partnerId && user) {
      loadMessages();
      const channel = setupRealtimeSubscription();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [partnerId, user]);

  const loadMessages = async () => {
    if (!partnerId || !user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('individual_chat_messages')
      .select(`
        *,
        sender:sender_id(first_name, last_name, photo_url)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Erreur chargement messages individuels:", error);
    } else {
      const formattedMessages = (data || []).map((msg: any) => ({
        ...msg,
        sender_name: `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`.trim(),
        sender_photo: msg.sender?.photo_url,
      }));
      setMessages(formattedMessages);
    }
    setLoading(false);
  };

  const sendMessage = async (messageText: string) => {
    if (!partnerId || !user || !messageText.trim()) return;

    const messageData = {
      sender_id: user.id,
      receiver_id: partnerId,
      message: messageText.trim(),
    };

    const { error } = await supabase.from('individual_chat_messages').insert(messageData);
    if (error) {
      console.error("Erreur envoi message individuel:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user || !partnerId) return null;

    const channel = supabase
      .channel(`individual-chat-${[user.id, partnerId].sort().join('-')}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'individual_chat_messages',
      }, (payload: any) => {
        if ((payload.new.sender_id === user.id && payload.new.receiver_id === partnerId) ||
            (payload.new.sender_id === partnerId && payload.new.receiver_id === user.id)) {
          loadMessages();
        }
      })
      .subscribe();

    return channel;
  };

  return { messages, loading, sendMessage };
};
