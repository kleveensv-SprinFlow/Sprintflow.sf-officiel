import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
import { Workout } from '../types';

export interface WorkoutTemplate {
  id: string;
  coach_id: string;
  template_name: string;
  workout_data: Omit<Workout, 'id' | 'user_id' | 'created_at'>;
  created_at: string;
}

export function useWorkoutTemplates() {
  const { user, profile } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!user || profile?.role !== 'coach') {
      setTemplates([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Erreur lors du chargement des modèles:", err);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (name: string, workoutData: Omit<Workout, 'id' | 'user_id' | 'created_at'>) => {
    if (!user || profile?.role !== 'coach') throw new Error('Seuls les coachs peuvent créer des modèles.');

    const { data, error } = await supabase
      .from('workout_templates')
      .insert({
        template_name: name,
        coach_id: user.id,
        workout_data: workoutData,
      })
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setTemplates(prev => [data, ...prev]);
    }
    return data;
  };

  const deleteTemplate = async (templateId: string) => {
    if (!user || profile?.role !== 'coach') throw new Error('Seuls les coachs peuvent supprimer des modèles.');

    const { error } = await supabase.from('workout_templates').delete().eq('id', templateId);

    if (error) throw error;
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const updateTemplate = async (templateId: string, name: string, workoutData: Omit<Workout, 'id' | 'user_id' | 'created_at'>) => {
    if (!user || profile?.role !== 'coach') throw new Error('Seuls les coachs peuvent modifier des modèles.');

    const { data, error } = await supabase
      .from('workout_templates')
      .update({ template_name: name, workout_data: workoutData })
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    if(data) {
        setTemplates(prev => prev.map(t => t.id === templateId ? data : t));
    }
    return data;
  }

  return {
    templates,
    loading,
    error,
    createTemplate,
    deleteTemplate,
    updateTemplate,
    refresh: fetchTemplates,
  };
}
