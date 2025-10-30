import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

type CoachLink = {
  coach_id: string;
  athlete_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  profiles: Profile;
};

export const useCoachLinks = (userId: string | undefined) => {
  const [linkedAthletes, setLinkedAthletes] = useState<Profile[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<CoachLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLinkedAthletes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('coach_athlete_links')
        .select('athlete_id, profiles:athlete_id (*)')
        .eq('coach_id', userId)
        .eq('status', 'ACCEPTED');

      if (error) throw error;
      setLinkedAthletes(data?.map(item => item.profiles) || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchPendingInvitations = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('coach_athlete_links')
        .select('*, profiles:coach_id (*)')
        .eq('athlete_id', userId)
        .eq('status', 'PENDING');

      if (error) throw error;
      setPendingInvitations(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateInvitationStatus = async (coachId: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('coach_athlete_links')
        .update({ status })
        .eq('coach_id', coachId)
        .eq('athlete_id', userId);

      if (error) throw error;
      await fetchPendingInvitations();
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (athleteId: string) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('coach_athlete_links')
        .insert({ coach_id: userId, athlete_id: athleteId, status: 'PENDING' });

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  const refresh = useCallback(() => {
    fetchLinkedAthletes();
    fetchPendingInvitations();
  }, [fetchLinkedAthletes, fetchPendingInvitations]);

  useEffect(() => {
    if(userId) {
      refresh();
    }
  }, [userId, refresh]);

  return { linkedAthletes, pendingInvitations, loading, error, updateInvitationStatus, sendInvitation, refresh };
};
