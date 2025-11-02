import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';
import { PostgrestError } from '@supabase/supabase-js';

// Définition des types de séances standards
export const STANDARD_WORKOUT_TYPES = [
  { id: 'lactique_piste', name: 'Lactique Piste', color: '#ef4444' }, // red-500
  { id: 'lactique_cote', name: 'Lactique Côte', color: '#f97316' }, // orange-500
  { id: 'vitesse_max', name: 'Vitesse Max', color: '#eab308' }, // yellow-500
  { id: 'aerobie', name: 'Aérobie', color: '#3b82f6' }, // blue-500
  { id: 'musculation', name: 'Musculation', color: '#8b5cf6' }, // violet-500
  { id: 'repos', name: 'Repos', color: '#6b7280' }, // gray-500
  { id: 'etirement', name: 'Étirement', color: '#10b981' }, // emerald-500
];

export interface WorkoutType {
  id: string;
  name: string;
  color: string;
  isCustom: boolean;
}

export const useWorkoutTypes = () => {
  const { user } = useAuth();
  const [customWorkoutTypes, setCustomWorkoutTypes] = useState<WorkoutType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchCustomWorkoutTypes = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('custom_workout_types')
      .select('id, name, color')
      .eq('coach_id', user.id);

    if (error) {
      console.error('Error fetching custom workout types:', error);
      setError(error);
      setCustomWorkoutTypes([]);
    } else {
      setCustomWorkoutTypes(data.map(item => ({ ...item, isCustom: true })));
      setError(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCustomWorkoutTypes();
  }, [fetchCustomWorkoutTypes]);

  const createCustomWorkoutType = async (name: string, color: string) => {
    if (!user) throw new Error('User must be logged in to create a custom workout type.');

    const { data, error } = await supabase
      .from('custom_workout_types')
      .insert({ name, color, coach_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom workout type:', error);
      throw error;
    }

    if (data) {
      const newType = { ...data, isCustom: true };
      setCustomWorkoutTypes(prev => [...prev, newType]);
      return newType;
    }
    return null;
  };

  const allWorkoutTypes = [...STANDARD_WORKOUT_TYPES.map(t => ({ ...t, isCustom: false })), ...customWorkoutTypes];

  return { allWorkoutTypes, loading, error, createCustomWorkoutType };
};
