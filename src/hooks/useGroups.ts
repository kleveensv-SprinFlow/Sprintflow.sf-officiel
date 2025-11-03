import { useState, useEffect, useCallback, useMemo } from 'react'; // Ajout de useMemo
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
import { Profile } from '../types';

// Étend le type Group pour inclure le nouveau code d'invitation
export interface Group {
  id: string;
  name: string;
  coach_id: string;
  created_at: string;
  invitation_code: string; // Ajout du code d'invitation
  group_members: { athlete_id: string; profiles: Profile | null }[];
}

// Nouveau type pour les demandes d'adhésion
export interface JoinRequest {
  id: string;
  group_id: string;
  athlete_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  // On inclut le profil de l'athlète qui fait la demande
  profiles: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null;
}

export const useGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          coach_id,
          created_at,
          invitation_code,
          group_members (
            athlete_id,
            profiles (
              id,
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .eq('coach_id', user.id);

      if (error) {
        throw error;
      }
      
      setGroups(data || []);
    } catch (e: any) {
      console.error("Erreur lors de la récupération des groupes:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // --- CORRECTION : Re-créer la liste `coachAthletes` ---
  const coachAthletes = useMemo(() => {
    const allAthletes = new Map<string, Profile>();
    groups.forEach(group => {
        group.group_members.forEach(member => {
            if (member.profiles && !allAthletes.has(member.athlete_id)) {
                allAthletes.set(member.athlete_id, member.profiles);
            }
        });
    });
    return Array.from(allAthletes.values());
  }, [groups]);


  const createGroup = async (name: string) => {
    if (!user) throw new Error("Utilisateur non authentifié.");

    const { data, error } = await supabase
      .from('groups')
      .insert({ name, coach_id: user.id })
      .select()
      .single();

    if (error) throw error;

    if (data) {
        // Pour rafraîchir la liste avec le nouveau groupe complet
        await fetchGroups();
    }
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
      .select(`
        id,
        group_id,
        athlete_id,
        status,
        created_at,
        profiles (
            id,
            first_name,
            last_name,
            avatar_url
        )
      `)
      .eq('group_id', groupId)
      .eq('status', 'pending');

    if (error) {
      console.error("Erreur fetchJoinRequests:", error);
      throw error;
    }
    return data || [];
  }, []);
  
  const respondToRequest = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    const { data, error } = await supabase.rpc('respond_to_join_request', {
      request_id_param: requestId,
      new_status_param: newStatus
    });

    if (error) throw error;

    const result = data as { status: string; message: string };
    if (result.status === 'error') {
        throw new Error(result.message);
    }
    
    if (newStatus === 'accepted') {
        await fetchGroups();
    }

    return result;
  };
  
  const joinGroupWithCode = async (invitationCode: string) => {
    const { data, error } = await supabase.rpc('join_group_with_code', {
        invitation_code_param: invitationCode
    });

    if (error) throw error;

    const result = data as { status: string; message: string };
    if (result.status === 'error') {
        throw new Error(result.message);
    }
    return result;
  };


  return {
    groups,
    loading,
    error,
    coachAthletes, // On l'exporte à nouveau
    createGroup,
    deleteGroup,
    fetchGroups,
    fetchJoinRequests,
    respondToRequest,
    joinGroupWithCode,
  };
};