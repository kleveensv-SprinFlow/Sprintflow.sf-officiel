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
      console.log('❌ Aucun ID utilisateur disponible');
      setLoading(false);
      return;
    }

    console.log('🔍 Récupération des records pour:', idToFetch);
    setLoading(true);
    setError(null);

    try {
      // Solution 1: Essayer avec la fonction RPC
      console.log('📞 Tentative avec RPC get_user_records_split...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_records_split', { 
        user_id_param: idToFetch 
      });

      if (!rpcError && rpcData) {
        console.log('✅ Records récupérés via RPC:', rpcData);
        setStrengthRecords(rpcData.strength_records || []);
        setTrackRecords(rpcData.track_records || []);
        return;
      }

      // Solution 2: Si la RPC échoue, récupérer directement depuis la table
      console.log('⚠️ RPC a échoué, tentative directe...', rpcError?.message);
      
      const { data: allRecords, error: directError } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', idToFetch)
        .order('date', { ascending: false });

      if (directError) {
        throw new Error(`Erreur lors de la récupération des records: ${directError.message}`);
      }

      console.log('📊 Records récupérés directement:', allRecords?.length || 0);

      // Séparer les records en force et course
      const strength: Record[] = [];
      const track: Record[] = [];

      allRecords?.forEach((record: any) => {
        const recordObj: Record = {
          id: record.id,
          user_id: record.user_id,
          exercise_name: record.exercise_name,
          value: record.value,
          unit: record.unit,
          date: record.date,
          type: record.type,
          shoe_type: record.shoe_type,
          location: record.location,
          weather: record.weather,
          notes: record.notes,
          created_at: record.created_at
        };

        // Catégoriser: 'run', 'jump', 'throw' = track, 'exercise' = strength
        if (record.type === 'run' || record.type === 'jump' || record.type === 'throw') {
          track.push(recordObj);
        } else if (record.type === 'exercise') {
          strength.push(recordObj);
        }
      });

      console.log('💪 Records de force:', strength.length);
      console.log('🏃 Records de course:', track.length);

      setStrengthRecords(strength);
      setTrackRecords(track);

    } catch (e: any) {
      console.error("❌ Erreur lors de la récupération des records:", e.message);
      setError(e.message);
      setStrengthRecords([]);
      setTrackRecords([]);
    } finally {
      setLoading(false);
    }
  }, [idToFetch]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Retourner aussi tous les records combinés pour compatibilité
  const records = [...strengthRecords, ...trackRecords];

  return { 
    strengthRecords, 
    trackRecords, 
    records, // Ajout pour compatibilité avec les composants existants
    loading, 
    error, 
    refreshRecords: fetchRecords,
    deleteRecord: async (recordId: string) => {
      try {
        const { error } = await supabase
          .from('records')
          .delete()
          .eq('id', recordId);
        
        if (error) throw error;
        
        // Rafraîchir les records après suppression
        await fetchRecords();
      } catch (e: any) {
        console.error('Erreur lors de la suppression:', e.message);
        throw e;
      }
    }
  };
};