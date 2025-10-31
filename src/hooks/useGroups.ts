import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
import { Profile } from '../types';

export interface Group {
  id: string;
  coach_id: string;
  name: string;
  created_at: string;
  members: GroupMember[];
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  profile?: Profile;
}

export function useGroups() {
  const { user, profile } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!user || !profile) {
      setGroups([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (profile.role === 'coach') {
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*, members:group_members(*, profile:profiles(*))')
          .eq('coach_id', user.id);

        if (groupsError) throw groupsError;

        setGroups(groupsData || []);

      } else if (profile.role === 'athlete') {
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('group:groups(*)')
          .eq('user_id', user.id);

        if (memberError) throw memberError;

        const groupIds = memberData?.map(m => m.group.id) || [];
        if (groupIds.length > 0) {
            const { data: groupsData, error: groupsError } = await supabase
                .from('groups')
                .select('*, members:group_members(*, profile:profiles(*))')
                .in('id', groupIds);

            if (groupsError) throw groupsError;
            setGroups(groupsData || []);
        } else {
            setGroups([]);
        }
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Erreur lors du chargement des groupes:", err);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (name: string) => {
    if (!user || profile?.role !== 'coach') throw new Error('Seuls les coachs peuvent créer des groupes.');

    const { data, error } = await supabase
      .from('groups')
      .insert({ name, coach_id: user.id })
      .select()
      .single();

    if (error) throw error;

    if (data) {
        const newGroup: Group = { ...data, members: [] };
        setGroups(prev => [newGroup, ...prev]);
    }
    return data;
  };

  const deleteGroup = async (groupId: string) => {
    if (!user || profile?.role !== 'coach') throw new Error('Seuls les coachs peuvent supprimer des groupes.');

    const { error } = await supabase.from('groups').delete().eq('id', groupId);

    if (error) throw error;
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const addMemberToGroup = async (groupId: string, userId: string) => {
    if (!user || profile?.role !== 'coach') throw new Error('Action non autorisée.');

    const { error } = await supabase.from('group_members').insert({ group_id: groupId, user_id: userId });

    if (error) throw error;
    await fetchGroups();
  };

  const removeMemberFromGroup = async (groupId: string, userId: string) => {
    if (!user || profile?.role !== 'coach') throw new Error('Action non autorisée.');

    const { error } = await supabase.from('group_members').delete().match({ group_id: groupId, user_id: userId });

    if (error) throw error;
    await fetchGroups();
  };

  return {
    groups,
    loading,
    error,
    createGroup,
    deleteGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    refresh: fetchGroups
  };
}