import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
import { Profile } from '../types';

export interface Group {
  id: string;
  name: string;
  coach_id: string;
  created_at: string;
  invitation_code: string;
  type: 'groupe' | 'athlete';
  max_members: number | null;
  color?: string; // New field for group theme color
  group_members: { athlete_id: string; profiles: Profile | null }[];
}

export interface GroupAnalytics {
  group_id: string;
  group_name: string;
  member_count: number;
  avg_score: number;
  checkin_count: number;
  alerts_count: number;
  pending_requests_count: number;
  max_members: number | null;
  color?: string;
}

export interface JoinRequest {
  id: string;
  group_id: string;
  athlete_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'photo_url'> | null;
}

/**
 * Hook pour gérer la logique des groupes et des suivis.
 */
export const useGroups = () => {
  const { user, profile } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsAnalytics, setGroupsAnalytics] = useState<GroupAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charge les groupes complets (structure)
  const fetchGroups = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    setError(null);

    try {
      let rawData;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout chargement groupes après 10s')), 10000)
      );

      if (profile.role === 'coach') {
        const groupsPromise = supabase
          .from('groups')
          .select(`
            id, name, coach_id, created_at, invitation_code, type, max_members, color,
            group_members (
              athlete_id,
              profiles (
                id, first_name, last_name, photo_url, role,
                date_de_naissance, sexe, height, discipline, license_number
              )
            )
          `)
          .eq('coach_id', user.id);

        const { data: coachGroups, error: coachError } = (await Promise.race([
          groupsPromise,
          timeoutPromise,
        ])) as any;

        if (coachError) throw coachError;
        rawData = coachGroups;
      } else {
        const groupsPromise = supabase
          .from('group_members')
          .select(`
            groups (
              id, name, coach_id, created_at, invitation_code, type, max_members, color,
              group_members (
                athlete_id,
                profiles (
                  id, first_name, last_name, photo_url, role,
                  date_de_naissance, sexe, height, discipline, license_number
                )
              )
            )
          `)
          .eq('athlete_id', user.id);

        const { data: athleteGroups, error: athleteError } = (await Promise.race([
          groupsPromise,
          timeoutPromise,
        ])) as any;

        if (athleteError) throw athleteError;
        rawData = athleteGroups?.map((item: any) => item.groups).filter(Boolean) || [];
      }

      if (rawData) {
        setGroups(rawData);
      } else {
        setGroups([]);
      }
    } catch (e: any) {
      console.error('[useGroups] Erreur lors de la récupération des groupes :', e);
      setError(e);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Charge les analytics des groupes (pour le coach uniquement)
  const fetchGroupsAnalytics = useCallback(async () => {
    if (!user || profile?.role !== 'coach') return;
    
    try {
      // Calculate local date to ensure we match the user's perception of "today"
      const d = new Date();
      const offset = d.getTimezoneOffset() * 60000;
      const today = new Date(d.getTime() - offset).toISOString().split('T')[0];

      const { data, error } = await supabase.rpc('get_coach_groups_analytics', {
        coach_uuid: user.id,
        query_date: today // Pass local date
      });

      if (error) throw error;
      setGroupsAnalytics(data as GroupAnalytics[] || []);
    } catch (e) {
      console.error('[useGroups] Erreur analytics:', e);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchGroups();
    if (profile?.role === 'coach') {
      fetchGroupsAnalytics();
    }
  }, [fetchGroups, fetchGroupsAnalytics, profile?.role]);

  // Regroupe tous les athlètes d’un coach sans doublons
  const coachAthletes = useMemo(() => {
    try {
      const allAthletes = new Map<string, Profile>();
      if (!groups) return [];
      groups.forEach(group => {
        if (group && group.group_members) {
          group.group_members.forEach(member => {
            if (member && member.profiles && !allAthletes.has(member.athlete_id)) {
              allAthletes.set(member.athlete_id, member.profiles);
            }
          });
        }
      });
      return Array.from(allAthletes.values());
    } catch (e) {
      console.error('Erreur critique lors du calcul de coachAthletes :', e);
      return [];
    }
  }, [groups]);

  const createGroup = async (name: string, type: 'groupe' | 'athlete', max_members: number | null, color: string = '#3B82F6') => {
    if (!user) throw new Error('Utilisateur non authentifié.');
    const groupData: {
      name: string;
      coach_id: string;
      type: 'groupe' | 'athlete';
      max_members?: number | null;
      color: string;
    } = {
      name,
      coach_id: user.id,
      type,
      color,
    };
    if (max_members !== null) {
      groupData.max_members = max_members;
    }
    const { data, error } = await supabase.from('groups').insert(groupData).select().single();
    if (error) throw error;
    if (data) {
      await fetchGroups();
      await fetchGroupsAnalytics();
    }
    return data;
  };

  const deleteGroup = async (groupId: string) => {
    const { error } = await supabase.rpc('delete_group', {
      group_id_param: groupId,
    });
    if (error) {
      if (error.message.includes('Accès non autorisé')) {
        throw new Error("Vous n'êtes pas autorisé à supprimer ce groupe.");
      }
      throw error;
    }
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setGroupsAnalytics(prev => prev.filter(g => g.group_id !== groupId));
  };

  const fetchJoinRequests = useCallback(async (groupId: string): Promise<JoinRequest[]> => {
    const { data, error } = await supabase
      .from('group_join_requests')
      .select(`*, profiles ( id, first_name, last_name, photo_url )`)
      .eq('group_id', groupId)
      .eq('status', 'pending');
    if (error) throw error;
    return data || [];
  }, []);

  const respondToRequest = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    const { data, error } = await supabase.rpc('respond_to_join_request', {
      request_id_param: requestId,
      new_status_param: newStatus,
    });
    if (error) throw error;
    const result = data as { status: string; message: string };
    if (result.status === 'error') throw new Error(result.message);
    
    if (newStatus === 'accepted') {
      await fetchGroups();
      await fetchGroupsAnalytics();
    }
    return result;
  };

  const joinGroupWithCode = async (invitationCode: string) => {
    if (profile?.role === 'athlete' && groups.length > 0) {
      throw new Error("Vous êtes déjà dans un groupe. Vous ne pouvez pas en rejoindre un autre.");
    }
    const { data, error } = await supabase.rpc('join_group_with_code', {
      invitation_code_param: invitationCode,
    });
    if (error) throw error;
    const result = data as { status: string; message: string };
    if (result.status === 'error') throw new Error(result.message);
    if (result.message.toLowerCase().includes('succès')) {
      await fetchGroups();
    }
    return result;
  };

  const leaveGroup = async (groupId: string) => {
    const { error } = await supabase.rpc('leave_group', {
      group_id_param: groupId,
    });
    if (error) throw error;
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  return {
    groups,
    groupsAnalytics,
    loading,
    error,
    coachAthletes,
    createGroup,
    deleteGroup,
    fetchGroups,
    fetchGroupsAnalytics,
    fetchJoinRequests,
    respondToRequest,
    joinGroupWithCode,
    leaveGroup,
  };
};
