import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { WorkoutMuscu } from '../types';
import { CourseBlockData } from '../components/workouts/CourseBlockForm';

export type BlockTemplate = {
  id: string;
  user_id: string;
  name: string;
  block_type: 'course' | 'muscu' | 'text';
  block_data_json: CourseBlockData | WorkoutMuscu | { content: string };
  created_at: string;
};

export const useBlockTemplates = (userId: string | undefined) => {
  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('block_templates')
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

  const createTemplate = async (name: string, blockType: 'course' | 'muscu' | 'text', blockData: CourseBlockData | WorkoutMuscu | { content: string }) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('block_templates')
        .insert({ user_id: userId, name, block_type: blockType, block_data_json: blockData });

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
        .from('block_templates')
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
    if (userId) {
      fetchTemplates();
    }
  }, [userId, fetchTemplates]);

  return { templates, loading, error, createTemplate, deleteTemplate, refresh: fetchTemplates };
};
