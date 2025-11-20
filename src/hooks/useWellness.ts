import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type WellnessLog = {
  id?: string;
  user_id: string;
  date: string;
  ressenti_sommeil: number | null;
  stress_level: number | null;
  muscle_fatigue: number | null;
  energie_subjective: number | null;
  humeur_subjective: number | null;
  menstruations: boolean | null;
  heure_coucher: string | null;
  heure_lever: string | null;
  duree_sommeil_calculee: number | null;
  rpe_difficulty?: number;
  workout_id?: string;
};

export type DailyCheckinData = Omit<WellnessLog, 'id' | 'user_id' | 'rpe_difficulty' | 'workout_id'>;


export const useWellness = (userId: string | undefined) => {
  const [wellnessData, setWellnessData] = useState<WellnessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWellnessData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('wellness_log')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      setWellnessData(data as WellnessLog[] || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const logDailyCheckin = async (log: DailyCheckinData) => {
    if (!userId) throw new Error("User not found");
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('wellness_log')
        .upsert({ ...log, user_id: userId }, { onConflict: 'user_id,date' });

      if (error) throw error;
      await fetchWellnessData();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logRpe = async (workoutId: string, rpe: number) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('wellness_log')
        .update({ rpe_difficulty: rpe, workout_id: workoutId })
        .eq('user_id', userId)
        .eq('date', today);

      if (error) throw error;
      await fetchWellnessData();
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWellnessData();
    }
  }, [userId, fetchWellnessData]);

  return { wellnessData, loading, error, logDailyCheckin, logRpe, refresh: fetchWellnessData };
};
