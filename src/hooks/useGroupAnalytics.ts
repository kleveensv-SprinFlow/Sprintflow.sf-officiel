import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { GroupRecord } from '../types';

export const useGroupAnalytics = (groupId?: string) => {
  const [groupRecords, setGroupRecords] = useState<GroupRecord[]>([]);
  const [groupWellnessScore, setGroupWellnessScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupData = useCallback(async () => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Recent Records
      const { data: recordsData, error: recordsError } = await supabase
        .rpc('get_group_recent_records', { 
          p_group_id: groupId, 
          p_limit: 20 
        });

      if (recordsError) throw recordsError;
      setGroupRecords(recordsData || []);

      // 2. Fetch Wellness Score (using existing or new RPC)
      // Since db push fails in this env, we might get an error here in real usage if migration didn't run.
      // But we wrote the code for it.
      const { data: scoreData, error: scoreError } = await supabase
        .rpc('get_group_daily_wellness_score', { 
          p_group_id: groupId 
        });

      if (scoreError) throw scoreError;
      setGroupWellnessScore(scoreData || 0);

    } catch (e: any) {
      console.error("❌ [useGroupAnalytics] Error:", e.message);
      setError(e.message);
      // Fallback for dev environment without working RPCs:
      // We can return empty or mocked data if needed, but usually we just show error or nothing.
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  return {
    groupRecords,
    groupWellnessScore,
    loading,
    error,
    refresh: fetchGroupData
  };
};
