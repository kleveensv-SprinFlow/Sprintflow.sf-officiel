import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface WellnessTrendPoint {
  day: string;
  avg_wellness: number;
}

interface Adherence {
  completed: number;
  planned: number;
  rate: number;
}

interface TeamHealth {
  wellnessTrend: WellnessTrendPoint[];
  adherence: Adherence;
}

interface PendingWellness {
  athlete_id: string;
  full_name: string;
  avatar_url?: string;
}

interface PendingValidation {
  workout_id: string;
  athlete_id: string;
  full_name: string;
  avatar_url?: string;
  workout_title: string;
  scheduled_date: string;
}

interface PriorityActions {
  pendingWellness: PendingWellness[];
  pendingValidation: PendingValidation[];
}

export interface CoachDashboardData {
  teamHealth: TeamHealth;
  priorityActions: PriorityActions;
}

export const useCoachDashboard = () => {
  const [data, setData] = useState<CoachDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_coach_dashboard_analytics');

      if (rpcError) {
        throw new Error(`Erreur lors de la récupération des données du tableau de bord : ${rpcError.message}`);
      }

      setData(rpcData as CoachDashboardData);

    } catch (e) {
      const errorMessage = (e instanceof Error) ? e.message : 'Une erreur inconnue est survenue.';
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { data, loading, error, refreshData: fetchDashboardData };
};
