import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PlanningPhase, PhaseCreationPayload } from '../types/planning';
import { format } from 'date-fns';

interface FetchPhasesParams {
  type: 'group' | 'athlete';
  id: string;
}

export const useTrainingPhases = (context: FetchPhasesParams | null) => {
  const [phases, setPhases] = useState<PlanningPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhases = useCallback(async () => {
    if (!context) {
      setPhases([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('training_phases').select('*');

      if (context.type === 'athlete') {
        const { data: groupMemberships } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('athlete_id', context.id);
            
        const groupIds = groupMemberships?.map(gm => gm.group_id) || [];
        
        let orCondition = `athlete_id.eq.${context.id}`;
        if (groupIds.length > 0) {
            orCondition += `,group_id.in.(${groupIds.join(',')})`;
        }
        
        query = query.or(orCondition);
        
      } else {
        query = query.eq('group_id', context.id);
      }
      
      const { data, error: err } = await query.order('start_date', { ascending: true });
      
      if (err) throw err;
      
      setPhases(data as PlanningPhase[]);
      
    } catch (err: any) {
      console.error('Error fetching phases:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  const createPhase = async (payload: PhaseCreationPayload) => {
    try {
      const { data, error } = await supabase
        .from('training_phases')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      
      setPhases(prev => [...prev, data as PlanningPhase]);
      return data;
    } catch (err: any) {
      console.error('Error creating phase:', err);
      throw err;
    }
  };

  const updatePhase = async (id: string, payload: Partial<PhaseCreationPayload>) => {
    try {
      const { data, error } = await supabase
        .from('training_phases')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setPhases(prev => prev.map(p => p.id === id ? (data as PlanningPhase) : p));
      return data;
    } catch (err: any) {
      console.error('Error updating phase:', err);
      throw err;
    }
  };

  const deletePhase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('training_phases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPhases(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting phase:', err);
      throw err;
    }
  };

  const getPhaseForDate = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const relevantPhases = phases.filter(p => {
        return dateStr >= p.start_date && dateStr <= p.end_date;
    });

    if (relevantPhases.length === 0) return null;

    relevantPhases.sort((a, b) => {
        if (a.athlete_id && !b.athlete_id) return -1;
        if (!a.athlete_id && b.athlete_id) return 1;
        return 0; 
    });

    return relevantPhases[0];
  }, [phases]);

  return {
    phases,
    loading,
    error,
    createPhase,
    updatePhase,
    deletePhase,
    getPhaseForDate,
    refreshPhases: fetchPhases
  };
};
