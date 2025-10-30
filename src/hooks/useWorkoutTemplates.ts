import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Workout } from '../types';

export type WorkoutTemplate = {
  id: string;
  user_id: string;
  name: string;
  structure_json: Omit<Workout, 'id'>;
  created_at: string;
};

export const useWorkoutTemplates = (userId: string | undefined) => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createTemplate = async (name: string, structure: Omit<Workout, 'id'>) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('workout_templates')
        .insert({ user_id: userId, name, structure_json: structure });

      if (error) throw error;
      await fetchTemplates();
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteTemplate = async (templateId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      await fetchTemplates();
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(userId) {
      fetchTemplates();
    }
  }, [userId, fetchTemplates]);

  return { templates, loading, error, createTemplate, deleteTemplate, refresh: fetchTemplates };
};
