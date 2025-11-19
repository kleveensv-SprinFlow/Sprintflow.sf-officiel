import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
import { Profile } from '../types';
import { logger } from '../utils/logger';


export interface Group {
  id: string;
  name: string;
  coach_id: string;
  created_at: string;
  invitation_code: string;
  type: 'groupe' | 'athlete';
  max_members: number | null;
  group_members: { athlete_id: string; profiles: Profile | null }[];
}

export interface JoinRequest {
  id: string;
  group_id: string;
  athlete_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'photo_url'> | null;
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

    logger.info('[useGroups] Début chargement groupes, role:', profile.role);
    const timerId = logger.time('[useGroups] Temps total de chargement');

    try {
      let rawData;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout chargement groupes après 10s')), 10000)
      );

      if (profile.role === 'coach') {
        logger.info('[useGroups] Chargement groupes coach');
        const groupsPromise = supabase
          .from('groups')
          .select(`
            id, name, coach_id, created_at, invitation_code, type, max_members,
            group_members (
              athlete_id,
              profiles (
                id, first_name, last_name, photo_url, role,
                date_de_naissance, sexe, height, discipline, license_number
              )
            )
          `)
          .eq('coach_id', user.id);

        const { data: coachGroups, error: coachError } = await Promise.race([
          groupsPromise,
          timeoutPromise
        ]) as any;

        if (coachError) throw coachError;
        rawData = coachGroups;
      } else {
        logger.info('[useGroups] Chargement groupes athlète');
        const groupsPromise = supabase
          .from('group_members')
          .select(`
            groups (
              id, name, coach_id, created_at, invitation_code, type, max_members,
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

        const { data: athleteGroups, error: athleteError } = await Promise.race([
          groupsPromise,
          timeoutPromise
        ]) as any;

        if (athleteError) throw athleteError;
        rawData = athleteGroups?.map((item: any) => item.groups).filter(Boolean) || [];
      }

      logger.timeEnd(timerId);

      if (rawData && rawData.length > 0) {
        logger.info('[useGroups] Groupes chargés:', rawData.length);
        setGroups(rawData);
      } else {
        logger.info('[useGroups] Aucun groupe trouvé');
        setGroups([]);
      }

    } catch (e: any) {
      logger.timeEnd(timerId);
      logger.error('[useGroups] Erreur lors de la récupération des groupes:', e);
      logger.error('[useGroups] Détails:', e.message, e.code);
      setError(e);
      setGroups([]);
    } finally {
      setLoading(false);
      logger.info('[useGroups] Chargement terminé');
    }
  }, [user, profile]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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
      console.error("Erreur critique lors du calcul de coachAthletes:", e);
      return [];
    }
  }, [groups]);

  const createGroup = async (name: string, type: 'groupe' | 'athlete', max_members: number | null) => {
    if (!user) throw new Error("Utilisateur non authentifié.");
    
    const groupData: { 
      name: string; 
      coach_id: string; 
      type: 'groupe' | 'athlete';
      max_members?: number | null;
    } = {
      name,
      coach_id: user.id,
      type,
    };

    if (max_members !== null) {
      groupData.max_members = max_members;
    }

    const { data, error } = await supabase
      .from('groups')
      .insert(groupData)
      .select()
      .single();

    if (error) throw error;
    if (data) await fetchGroups();
    return data;
  };

  const deleteGroup = async (groupId: string) => {
    // Appel de la fonction RPC pour une suppression sécurisée
    const { error } = await supabase.rpc('delete_group', {
      group_id_param: groupId
    });
    
    if (error) {
        // Si l'erreur vient de la fonction (ex: accès non autorisé), afficher le message
        if (error.message.includes('Accès non autorisé')) {
            throw new Error('Vous n\'êtes pas autorisé à supprimer ce groupe.');
        }
        throw error;
    }
    
    // Mettre à jour l'état local pour refléter la suppression
    setGroups(prev => prev.filter(g => g.id !== groupId));
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
      new_status_param: newStatus
    });
    if (error) throw error;
    const result = data as { status: string; message: string };
    if (result.status === 'error') throw new Error(result.message);
    if (newStatus === 'accepted') await fetchGroups();
    return result;
  };

  const joinGroupWithCode = async (invitationCode: string) => {
    // Vérification côté client : L'athlète est-il déjà dans un groupe ?
    if (profile?.role === 'athlete' && groups.length > 0) {
      throw new Error("Vous êtes déjà dans un groupe. Vous ne pouvez pas en rejoindre un autre.");
    }

    const { data, error } = await supabase.rpc('join_group_with_code', {
      invitation_code_param: invitationCode
    });
    if (error) throw error;
    const result = data as { status: string; message: string };
    if (result.status === 'error') throw new Error(result.message);
    
    // Si la demande est acceptée automatiquement, rafraîchir la liste
    if (result.message.toLowerCase().includes('succès')) {
        await fetchGroups();
    }
    
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