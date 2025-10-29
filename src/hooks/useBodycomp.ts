// src/hooks/useBodycomp.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';

export interface BodycompData {
  id?: number;
  user_id: string;
  date: string;
  weight_kg: number;
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
        .from('bodycomp')
        .select('weight_kg')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        // Si aucune pesée n'est trouvée, initialiser avec un poids par défaut (ex: 75kg)
        if (error.code === 'PGRST116') {
          setLastWeight({ weight: 75 });
        } else {
          throw error;
        }
      } else if (data) {
        setLastWeight({ weight: data.weight_kg });
      } else {
        setLastWeight({ weight: 75 });
      }
    } catch (error) {
      console.error('Error fetching last weight:', error);
      // Fallback à un poids par défaut en cas d'erreur
      setLastWeight({ weight: 75 });
    } finally {
      setLoading(false);
    }
  };

  return { lastWeight, loading };
};