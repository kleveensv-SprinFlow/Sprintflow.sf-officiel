import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
import { Profile } from '../types';
import { logger } from '../utils/logger';

interface UsePersonalCoachReturn {
  personalCoach: Profile | null;
  isLoading: boolean;
  joinCoach: (code: string) => Promise<{ success: boolean; message: string }>;
  leaveCoach: (coachId: string) => Promise<{ success: boolean; message: string }>;
}

export const usePersonalCoach = (): UsePersonalCoachReturn => {
  const { user } = useAuth();
  const [personalCoach, setPersonalCoach] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPersonalCoach = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 1. Trouver le lien
      const { data: link, error: linkError } = await supabase
        .from('personal_coach_links')
        .select('coach_id')
        .eq('athlete_id', user.id)
        .single();

      if (linkError || !link) {
        setPersonalCoach(null);
        return;
      }

      // 2. Récupérer le profil du coach
      const { data: coachProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', link.coach_id)
        .single();

      if (profileError) throw profileError;
      
      setPersonalCoach(coachProfile);

    } catch (error) {
      logger.error('Erreur lors de la récupération du coach personnel:', error);
      setPersonalCoach(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPersonalCoach();
  }, [fetchPersonalCoach]);

  const joinCoach = async (code: string) => {
    try {
      const { data, error } = await supabase.rpc('join_personal_coach', { p_code: code });
      if (error) throw error;

      if (data.success) {
        await fetchPersonalCoach(); // Rafraîchir les données
      }
      return data;

    } catch (error) {
      logger.error('Erreur RPC join_personal_coach:', error);
      return { success: false, message: 'Une erreur est survenue.' };
    }
  };

  const leaveCoach = async (coachId: string) => {
     try {
      const { data, error } = await supabase.rpc('leave_personal_coach', { p_coach_id: coachId });
      if (error) throw error;

      if (data.success) {
        setPersonalCoach(null); // Mise à jour immédiate de l'état
      }
      return data;
      
    } catch (error) {
      logger.error('Erreur RPC leave_personal_coach:', error);
      return { success: false, message: 'Une erreur est survenue.' };
    }
  };


  return { personalCoach, isLoading, joinCoach, leaveCoach };
};
