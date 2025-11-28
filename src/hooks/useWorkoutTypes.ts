import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { DEFAULT_WORKOUT_TYPES } from '../data/workoutTypes';
import type { CustomWorkoutType, DefaultWorkoutType } from '../types';

export const useWorkoutTypes = () => {
  const { user, loading: authLoading } = useAuth();
  const [customTypes, setCustomTypes] = useState<CustomWorkoutType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomTypes = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // MOCK DATA FOR VERIFICATION
    if (user.id === 'mock-coach-id' || user.id === 'mock-athlete-id') {
        setCustomTypes([]);
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_workout_types')
        .select('*')
        .eq('coach_id', user.id);

      if (error) {
        throw error;
      }
      setCustomTypes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch custom workout types'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchCustomTypes();
    }
  }, [authLoading, fetchCustomTypes]);

  const addCustomType = async (name: string, color: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('custom_workout_types')
        .insert([{ name, color, coach_id: user.id }])
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      setCustomTypes(prev => [...prev, data]);
      return data;

    } catch (err) {
       setError(err instanceof Error ? err : new Error('Failed to add custom workout type'));
       return null;
    }
  };
  
  const allTypes: DefaultWorkoutType[] = useMemo(() => {
    const combined = [
      ...DEFAULT_WORKOUT_TYPES,
      ...customTypes.map(t => ({ id: t.id, name: t.name, color: t.color }))
    ];
    return combined;
  }, [customTypes]);


  return { allTypes, loading, error, addCustomType, refetch: fetchCustomTypes };
};