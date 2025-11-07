import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { EXERCICES_REFERENCE } from '../../data/exercices_reference';

export interface ExerciceReference {
  id: string;
  nom: string;
  categorie: string;
  type: 'reference' | 'custom';
  creator_id?: string;
}

const mapSupabaseToExerciceReference = (item: any): ExerciceReference => ({
  id: item.id,
  nom: item.nom,
  categorie: item.categorie,
  type: 'custom',
  creator_id: item.creator_id,
});

export const useExercices = () => {
  const [exercices, setExercices] = useState<ExerciceReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExercices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: customExercicesData, error: customError } = await supabase
        .from('exercices_personnalises')
        .select('id, nom, categorie, creator_id');

      if (customError) {
        throw new Error(`Erreur Supabase: ${customError.message}`);
      }
      
      const customExercices = customExercicesData.map(mapSupabaseToExerciceReference);
      
      const allExercices = [...EXERCICES_REFERENCE, ...customExercices];

      setExercices(allExercices);

    } catch (err: any) {
      console.error("Erreur lors du chargement des exercices:", err);
      setError(err.message || 'Une erreur est survenue.');
      setExercices(EXERCICES_REFERENCE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExercices();
  }, [loadExercices]);

  return { exercices, loading, error, loadExercices };
};