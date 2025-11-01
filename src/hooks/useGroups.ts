import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
import { Profile } from '../types';

export interface Group {
  id: string;
  coach_id: string;
  name: string;
  created_at: string;
  group_members: GroupMember[];
}

export interface GroupMember {
  group_id?: string;
  athlete_id: string;
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
          .select(`
            *,
            group_members(
              athlete_id,
              group_id,
              profile:profiles(id, first_name, last_name, avatar_url, date_de_naissance, discipline)
            )
          `)
          .eq('coach_id', user.id);

        if (groupsError) throw groupsError;

        console.log('📦 Groups data from Supabase:', JSON.stringify(groupsData, null, 2));
        setGroups(groupsData || []);

      } else if (profile.role === 'athlete') {
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('group:groups(*)')
          .eq('athlete_id', user.id);

        if (memberError) throw memberError;

        const groupIds = memberData?.map(m => m.group?.id).filter(Boolean) || [];
        if (groupIds.length > 0) {
            const { data: groupsData, error: groupsError } = await supabase
                .from('groups')
                .select(`
                  *,
                  group_members(
                    athlete_id,
                    group_id,
                    profile:profiles(id, first_name, last_name, avatar_url, date_de_naissance, discipline)
                  )
                `)
                .in('id', groupIds);

            if (groupsError) throw groupsError;
            console.log('📦 Groups data from Supabase (athlete):', JSON.stringify(groupsData, null, 2));
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

  const coachAthletes = useMemo(() => {
    if (profile?.role !== 'coach' || !groups) return [];

    const allMembers = groups.flatMap(g => g.group_members);
    const uniqueAthletes = new Map<string, Profile>();

    allMembers.forEach(member => {
      if (member.profile && !uniqueAthletes.has(member.athlete_id)) {
        uniqueAthletes.set(member.athlete_id, member.profile);
      }
    });

    return Array.from(uniqueAthletes.values());
  }, [groups, profile]);


  const createGroup = async (name: string) => {
    if (!user || profile?.role !== 'coach') throw new Error('Seuls les coachs peuvent créer des groupes.');

    const { data, error } = await supabase
      .from('groups')
      .insert({ name: name, coach_id: user.id })
      .select()
      .single();

    if (error) throw error;

    if (data) {
        const newGroup: Group = { ...data, group_members: [] };
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

  const addMemberToGroup = async (groupId: string, athleteId: string) => {
    if (!user || profile?.role !== 'coach') throw new Error('Seuls les coachs peuvent ajouter des membres.');

    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, athlete_id: athleteId });

    if (error) throw error;
    await fetchGroups();
  };

  const removeMemberFromGroup = async (groupId: string, athleteId: string) => {
    if (!user || profile?.role !== 'coach') throw new Error('Seuls les coachs peuvent retirer des membres.');

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('athlete_id', athleteId);

    if (error) throw error;
    await fetchGroups();
  };

  return {
    groups,
    coachAthletes,
    loading,
    error,
    createGroup,
    deleteGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    refresh: fetchGroups
  };
}