import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface IndicePoidsPuissanceData {
  indice: number;
  scoreCompo: number;
  scoreForce: number;
  categorieScores: Record<string, number>;
  details: {
    poids: number;
    taille: number;
    masseGrasse?: number;
  };
}

export function useIndicePoidsPuissance() {
  const [data, setData] = useState<IndicePoidsPuissanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIndice();
  }, []);

  const loadIndice = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setData(null);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get_indice_poids_puissance`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du calcul de l\'indice');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Error loading indice:', err);
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadIndice();
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
}
