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
  group_members: { athlete_id: string; profiles: Profile | null }[];
}

export interface JoinRequest {
  id: string;
  group_id: string;
  athlete_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null;
}

export const useGroups = () => {
  const { user, profile } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    setError(null);
    try {
      let data;

      if (profile.role === 'coach') {
        // Pour un coach : récupérer les groupes qu'il a créés
        const { data: coachGroups, error: coachError } = await supabase
          .from('groups')
          .select(`
            id, name, coach_id, created_at, invitation_code,
            group_members ( athlete_id, profiles ( id, first_name, last_name, avatar_url ) )
          `)
          .eq('coach_id', user.id);
        if (coachError) throw coachError;
        data = coachGroups;
      } else {
        // Pour un athlète : récupérer les groupes dont il est membre
        const { data: athleteGroups, error: athleteError } = await supabase
          .from('group_members')
          .select(`
            groups (
              id, name, coach_id, created_at, invitation_code,
              group_members ( athlete_id, profiles ( id, first_name, last_name, avatar_url ) )
            )
          `)
          .eq('athlete_id', user.id);
        if (athleteError) throw athleteError;
        // Extraire les groupes de la structure imbriquée
        data = athleteGroups?.map((item: any) => item.groups).filter(Boolean) || [];
      }

      setGroups(data || []);
    } catch (e: any) {
      console.error("Erreur lors de la récupération des groupes:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // --- VERSION CORRIGÉE ET ROBUSTE ---
  const coachAthletes = useMemo(() => {
    try {
      const allAthletes = new Map<string, Profile>();
      if (!groups) return []; // Sécurité si groups est null
      
      groups.forEach(group => {
        // Sécurité si un groupe ou ses membres sont mal formés
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
      console.error("Erreur critique lors du calcul de coachAthletes:", e);
      return []; // Retourne un tableau vide en cas d'erreur pour éviter le crash
    }
  }, [groups]);

  const createGroup = async (name: string) => {
    if (!user) throw new Error("Utilisateur non authentifié.");
    const { data, error } = await supabase
      .from('groups')
      .insert({ name, coach_id: user.id })
      .select().single();
    if (error) throw error;
    if (data) await fetchGroups();
    return data;
  };

  const deleteGroup = async (groupId: string) => {
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) throw error;
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const fetchJoinRequests = useCallback(async (groupId: string): Promise<JoinRequest[]> => {
    const { data, error } = await supabase
      .from('group_join_requests')
      .select(`*, profiles ( id, first_name, last_name, avatar_url )`)
      .eq('group_id', groupId)
      .eq('status', 'pending');
    if (error) throw error;
    return data || [];
  }, []);

  const respondToRequest = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    const { data, error } = await supabase.rpc('respond_to_join_request', {
      request_id_param: requestId,
      new_status_param: newStatus
    });
    if (error) throw error;
    const result = data as { status: string; message: string };
    if (result.status === 'error') throw new Error(result.message);
    if (newStatus === 'accepted') await fetchGroups();
    return result;
  };

  const joinGroupWithCode = async (invitationCode: string) => {
    const { data, error } = await supabase.rpc('join_group_with_code', {
      invitation_code_param: invitationCode
    });
    if (error) throw error;
    const result = data as { status: string; message: string };
    if (result.status === 'error') throw new Error(result.message);
    return result;
  };

  return {
    groups,
    loading,
    error,
    coachAthletes,
    createGroup,
    deleteGroup,
    fetchGroups,
    fetchJoinRequests,
    respondToRequest,
    joinGroupWithCode,
  };
};