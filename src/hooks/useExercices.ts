import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ExerciceReference {
  id: string;
  nom: string;
  categorie: string;
  type: 'reference' | 'custom';
  creator_id?: string;
}

const mapSupabaseToExerciceReference = (item: { id: string; nom: string; categorie: string; creator_id?: string }, type: 'reference' | 'custom'): ExerciceReference => ({
  id: item.id,
  nom: item.nom,
  categorie: item.categorie,
  type,
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
      // Fetch reference exercises from Supabase
      const { data: referenceExercicesData, error: referenceError } = await supabase
        .from('exercices_reference')
        .select('id, nom, categorie')
        .order('nom');

      if (referenceError) {
        throw new Error(`Erreur lors du chargement des exercices de référence: ${referenceError.message}`);
      }

      // Fetch custom exercises from Supabase
      const { data: customExercicesData, error: customError } = await supabase
        .from('exercices_personnalises')
        .select('id, nom, categorie, creator_id');

      if (customError) {
        throw new Error(`Erreur lors du chargement des exercices personnalisés: ${customError.message}`);
      }

      const referenceExercices = (referenceExercicesData || []).map((item) => mapSupabaseToExerciceReference(item, 'reference'));
      const customExercices = (customExercicesData || []).map((item) => mapSupabaseToExerciceReference(item, 'custom'));

      // Combine reference and custom exercises
      const allExercices = [...referenceExercices, ...customExercices];

      setExercices(allExercices);

    } catch (err: unknown) {
      console.error("Erreur lors du chargement des exercices:", err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setExercices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomExercise = useCallback(async (nom: string, categorie: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Vous devez être connecté pour créer un exercice.");
      }

      const { data, error } = await supabase
        .from('exercices_personnalises')
        .insert([
          {
            nom,
            categorie,
            creator_id: user.id
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Reload exercises to include the new one
      await loadExercices();
      return data;
    } catch (err: unknown) {
      console.error("Erreur lors de la création de l'exercice:", err);
      throw err;
    }
  }, [loadExercices]);

  useEffect(() => {
    loadExercices();
  }, [loadExercices]);

  return { exercices, loading, error, loadExercices, addCustomExercise };
};
