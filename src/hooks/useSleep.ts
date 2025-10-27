// src/hooks/useSleep.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface SleepData {
  id?: number;
  user_id: string;
  date: string;
  duration_hours?: number;
  quality_rating?: number;
  notes?: string;
}

export const useSleep = () => {
  const { user } = useAuth();
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchSleepData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sleep_data')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      setSleepData(data || []);
    } catch (err) {
      setError(err);
      console.error('Error fetching sleep data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveSleepData = async (data: Omit<SleepData, 'user_id' | 'id'>) => {
    if (!user) throw new Error("User must be logged in to save sleep data.");

    try {
      const sleepRecord = {
        ...data,
        user_id: user.id,
      };

      const { data: existingData, error: fetchError } = await supabase
        .from('sleep_data')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', sleepRecord.date)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // Ignore 'single row not found'
        throw fetchError;
      }
      
      if (existingData) {
        // Update existing record for the day
        const { error: updateError } = await supabase
          .from('sleep_data')
          .update(sleepRecord)
          .eq('id', existingData.id);
        
        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('sleep_data')
          .insert(sleepRecord);
          
        if (insertError) throw insertError;
      }

      // Refresh local data
      await fetchSleepData();
    } catch (err) {
      setError(err);
      console.error('Error saving sleep data:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSleepData();
  }, [fetchSleepData]);

  return {
    sleepData,
    loading,
    error,
    saveSleepData,
    refetchSleepData: fetchSleepData,
  };
};