import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface TrainingPhase {
  id: string;
  name: string;
  type: 'volume' | 'intensite' | 'recuperation' | 'competition';
  start_date: string;
  end_date: string;
  color?: string;
  coach_id: string;
  group_id?: string | null;
  athlete_id?: string | null;
}

export type TrainingPhasePayload = Omit<TrainingPhase, 'id' | 'coach_id' | 'created_at'>;

export const useTrainingPhases = (context: { type: 'group' | 'athlete'; id: string } | null) => {
  const [phases, setPhases] = useState<TrainingPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPhases = useCallback(async () => {
    if (!context) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('training_phases').select('*');

      if (context.type === 'group') {
        query = query.eq('group_id', context.id);
      } else {
        // Fetch athlete's groups first to implement inheritance
        const { data: memberData } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('athlete_id', context.id);

        const groupIds = memberData?.map(m => m.group_id).filter(id => id) || [];

        // Build OR query: phases assigned to athlete OR phases assigned to their groups
        if (groupIds.length > 0) {
           // Syntax: .or('athlete_id.eq.ID,group_id.in.(ID1,ID2)')
           query = query.or(`athlete_id.eq.${context.id},group_id.in.(${groupIds.join(',')})`);
        } else {
           query = query.eq('athlete_id', context.id);
        }
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setPhases(data || []);
    } catch (err) {
      console.error('Error fetching phases:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [context]);

  const createPhase = async (payload: TrainingPhasePayload) => {
    if (!context) return;
    const user = await supabase.auth.getUser();
    const coachId = user.data.user?.id;
    if (!coachId) throw new Error('Not authenticated');

    const dbPayload = {
      ...payload,
      coach_id: coachId,
      group_id: context.type === 'group' ? context.id : null,
      athlete_id: context.type === 'athlete' ? context.id : null,
    };

    const { data, error } = await supabase
      .from('training_phases')
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    setPhases(prev => [...prev, data]);
    return data;
  };

  const deletePhase = async (id: string) => {
    const { error } = await supabase
      .from('training_phases')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setPhases(prev => prev.filter(p => p.id !== id));
  };

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  return { phases, loading, error, createPhase, deletePhase, refreshPhases: fetchPhases };
};
