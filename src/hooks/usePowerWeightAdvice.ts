 import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdviceData {
  poids: {
    valeur: string;
    evolution: string | null;
    status: string;
    comment: string;
  };
  masseMaigre: {
    valeur: string;
    evolution: string | null;
    status: string;
    comment: string;
  };
  performance: {
    valeur: string;
    evolution: string | null;
    status: string;
    comment: string;
  };
  objectifs: string[];
  conseils: string[];
  nutrition: string[];
}

export const usePowerWeightAdvice = (score: number) => {
  const [advice, setAdvice] = useState<AdviceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we have a meaningful score or at least trigger once
    const fetchAdvice = async () => {
      setLoading(true);
      try {
        const { data, error: funcError } = await supabase.functions.invoke('conseils_poids_puissance', {
          body: { scoreData: { indice: score } }
        });

        if (funcError) throw funcError;
        setAdvice(data);
      } catch (err: any) {
        console.error("Error fetching advice:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (score > 0) {
        fetchAdvice();
    }
  }, [score]);

  return { advice, loading, error };
};
