import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Conversation } from '../types';
import useAuth from './useAuth';

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setConversations(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = async () => {
    if (!user) {
      const error = new Error("Utilisateur non authentifié.");
      setError(error.message);
      return { data: null, error };
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title: 'Nouvelle discussion' })
      .select()
      .single();
    
    if (data) {
      setConversations(prev => [data, ...prev]);
    }
    if (error) {
      setError(error.message);
    }
    
    return { data, error };
  };

  return { conversations, loading, error, createConversation, refresh: fetchConversations };
}
