import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type WellnessLog = {
  id: string;
  user_id: string;
  date: string;
  sleep_quality: number;
  stress_level: number;
  muscle_fatigue: number;
  rpe_difficulty?: number;
  workout_id?: string;
};

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
      setWellnessData(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const logDailyCheckin = async (log: Omit<WellnessLog, 'id' | 'user_id' | 'rpe_difficulty' | 'workout_id' | 'created_at'>) => {
    if (!userId) return;
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
    } finally {
      setLoading(false);
    }
  };

  const logRpe = async (workoutId: string, rpe: number) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      // We need to find the wellness log for today and update it
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
