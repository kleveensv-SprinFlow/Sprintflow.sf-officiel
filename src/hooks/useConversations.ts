import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Conversation } from '../types';
import useAuth from './useAuth';

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('pinned', { ascending: false })
        .order('last_activity', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setConversations(data || []);
      }
      setLoading(false);
    };

    fetchConversations();
  }, [user]);

  const createConversation = async (name?: string) => {
    if (!user) return null;
    
    const unpinnedConversations = conversations.filter(c => !c.pinned);
    if (unpinnedConversations.length >= 10) {
      const error = new Error("Limite de 10 conversations non épinglées atteinte.");
      setError(error.message);
      return { data: null, error };
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, name })
      .select()
      .single();
    
    if (data) setConversations(prev => [data, ...prev]);
    return { data, error };
  };

  const renameConversation = async (id: string, newName: string) => {
    const { error } = await supabase.from('conversations').update({ name: newName }).eq('id', id);
    if (!error) {
      setConversations(prev => prev.map(c => (c.id === id ? { ...c, name: newName } : c)));
    }
  };

  const pinConversation = async (id: string, isPinned: boolean) => {
    const { error } = await supabase.from('conversations').update({ pinned: isPinned }).eq('id', id);
    if (!error) {
      setConversations(prev => 
        prev
          .map(c => (c.id === id ? { ...c, pinned: isPinned } : c))
          .sort((a, b) => Number(b.pinned) - Number(a.pinned))
      );
    }
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase.from('conversations').delete().eq('id', id);
    if (!error) {
      setConversations(prev => prev.filter(c => c.id !== id));
    }
  };

  return { conversations, loading, error, createConversation, renameConversation, pinConversation, deleteConversation };
}
