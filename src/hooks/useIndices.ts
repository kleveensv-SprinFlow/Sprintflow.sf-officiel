import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';

export interface IndicesData {
  formIndex: number;
  performanceIndex: number;
  details: {
    composition: { mode: string; value: number };
    force: { score_explosivite: number; score_force_maximale: number };
    form: { days_tracked: number };
  };
  loading: boolean;
  error: Error | null;
}

export const useIndices = () => {
  // On récupère 'profile' pour vérifier le rôle
  const { user, session, profile } = useAuth();
  
  const [data, setData] = useState<IndicesData>({
    formIndex: 0,
    performanceIndex: 0,
    details: {
      composition: { mode: 'standard', value: 0 },
      force: { score_explosivite: 0, score_force_maximale: 0 },
      form: { days_tracked: 0 }
    },
    loading: true,
    error: null
  });

  const fetchIndices = useCallback(async () => {
    // CORRECTIF : On ne charge RIEN si c'est un coach ou si pas connecté
    if (!user || !session || profile?.role !== 'athlete') {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }
    
    try {
      setData(prev => ({ ...prev, loading: true }));
      
      // 1. Fetch Form Index (RPC)
      const { data: formData, error: formError } = await supabase
        .rpc('get_form_index', { p_user_id: user.id });
      
      if (formError) throw formError;

      // 2. Fetch Performance Index (Edge Function)
      const { data: perfData, error: perfError } = await supabase.functions.invoke('get_indice_performance', {
        headers: {
            Authorization: `Bearer ${session.access_token}`
        }
      });

      if (perfError) {
          // On log juste un warning au lieu de casser l'app
          console.warn("Info: Données de performance non disponibles", perfError);
      }

      setData({
        formIndex: formData?.score || 0,
        performanceIndex: perfData?.score || 0,
        details: {
          composition: perfData?.details?.composition || { mode: 'standard', value: 0 },
          force: perfData?.details?.force || { score_explosivite: 0, score_force_maximale: 0 },
          form: { days_tracked: formData?.days_tracked || 0 }
        },
        loading: false,
        error: null
      });

    } catch (err) {
      console.error('Error fetching indices:', err);
      setData(prev => ({ ...prev, loading: false, error: err as Error }));
    }
  }, [user, session, profile?.role]); // Ajout de la dépendance au rôle

  useEffect(() => {
    fetchIndices();
  }, [fetchIndices]);

  return { ...data, refresh: fetchIndices };
};