import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Message } from '../types';
import useAuth from './useAuth';

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!user || !conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }, [user, conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const addMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!user || !conversationId) {
      const error = new Error("Utilisateur ou conversation non valide.");
      setError(error.message);
      return { data: null, error };
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
        role,
      })
      .select()
      .single();
    
    if (data) {
      setMessages(prev => [...prev, data]);
    }
    if (error) {
      setError(error.message);
    }
    
    return { data, error };
  };

  return { messages, loading, error, addMessage, refresh: fetchMessages };
}
