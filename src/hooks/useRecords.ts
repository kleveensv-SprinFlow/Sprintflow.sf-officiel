import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Record } from '../types';
import useAuth from './useAuth';

export const useRecords = (athleteId?: string) => {
  const { user } = useAuth();
  const [strengthRecords, setStrengthRecords] = useState<Record[]>([]);
  const [trackRecords, setTrackRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idToFetch = athleteId || user?.id;

  const fetchRecords = useCallback(async () => {
    if (!idToFetch) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ▼▼▼ LA CORRECTION EST ICI ▼▼▼
      // On utilise la nouvelle fonction RPC 'get_user_records_split'
      // et on passe le paramètre correctement nommé 'user_id_param'.
      const { data, error: rpcError } = await supabase.rpc('get_user_records_split', { user_id_param: idToFetch });
      // ▲▲▲ FIN DE LA CORRECTION ▲▲▲

      if (rpcError) {
        throw new Error(`Erreur Supabase RPC: ${rpcError.message}`);
      }
      
      // La nouvelle fonction retourne un objet avec deux clés :
      // strength_records et track_records.
      if (data) {
        setStrengthRecords(data.strength_records || []);
        setTrackRecords(data.track_records || []);
      } else {
        setStrengthRecords([]);
        setTrackRecords([]);
      }

    } catch (e: any) {
      console.error("Erreur lors de la récupération des records:", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [idToFetch]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { strengthRecords, trackRecords, loading, error, refreshRecords: fetchRecords };
};