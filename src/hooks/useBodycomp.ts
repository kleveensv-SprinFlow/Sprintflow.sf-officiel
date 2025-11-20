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
  const [history, setHistory] = useState<BodycompData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('donnees_corporelles')
        .select('*')
        .eq('athlete_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching body composition:', error);
        setLastWeight({ weight: 75 });
        setHistory([]);
      } else if (data && data.length > 0) {
        setHistory(data);
        setLastWeight({ weight: data[0].poids_kg });
      } else {
        setLastWeight({ weight: 75 }); // Fallback default
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching body composition:', error);
      setLastWeight({ weight: 75 });
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return { lastWeight, history, loading, refresh: fetchData };
};
