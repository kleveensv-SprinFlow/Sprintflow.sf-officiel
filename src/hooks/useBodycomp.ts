import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';

export interface BodycompData {
  id?: string;
  athlete_id: string;
  date: string;
  poids_kg: number;
  masse_grasse_pct?: number;
  masse_musculaire_kg?: number;
  muscle_squelettique_kg?: number;
}

export const useBodycomp = () => {
  const { user } = useAuth();
  const [lastWeight, setLastWeight] = useState<{weight: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLastWeight();
    }
  }, [user]);

  const fetchLastWeight = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('donnees_corporelles')
        .select('poids_kg')
        .eq('athlete_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching last weight:', error);
        setLastWeight({ weight: 75 });
      } else if (data) {
        setLastWeight({ weight: data.poids_kg });
      } else {
        setLastWeight({ weight: 75 });
      }
    } catch (error) {
      console.error('Error fetching last weight:', error);
      setLastWeight({ weight: 75 });
    } finally {
      setLoading(false);
    }
  };

  return { lastWeight, loading };
};