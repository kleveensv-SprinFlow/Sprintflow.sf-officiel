import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';

export interface Conversation {
  conversation_id: string;
  conversation_type: 'group' | 'individual';
  conversation_name: string;
  last_message_content?: string;
  last_message_at?: string;
  last_message_sender_name?: string;
  unread_count: number;
  conversation_photo_url?: string;
  partner_id?: string;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_user_conversations');

      if (rpcError) {
        throw rpcError;
      }

      setConversations(data || []);
    } catch (e) {
      console.error("Erreur lors de la récupération des conversations:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const groupChannel = supabase
      .channel('public:group_chat_messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_chat_messages' },
        () => {
          console.log('Changement détecté dans les messages de groupe, rafraîchissement des conversations...');
          fetchConversations();
        }
      )
      .subscribe();

    const individualChannel = supabase
      .channel('public:individual_chat_messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'individual_chat_messages' },
        () => {
          console.log('Changement détecté dans les messages individuels, rafraîchissement des conversations...');
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(groupChannel);
      supabase.removeChannel(individualChannel);
    };
  }, [user]);

  return { conversations, loading, error, refreshConversations: fetchConversations };
};
