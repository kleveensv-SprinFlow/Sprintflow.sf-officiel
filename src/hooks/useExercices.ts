import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';

export interface ExerciceReference {
  id: string;
  nom: string;
  categorie: string;
  type: 'reference' | 'custom';
  creator_id?: string;
  groupe_exercice?: string; // Ajouté pour correspondre au schéma
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapSupabaseToExerciceReference = (item: any, type: 'reference' | 'custom'): ExerciceReference => ({
  id: item.id,
  nom: item.nom,
  categorie: item.categorie,
  type,
  creator_id: item.creator_id,
  groupe_exercice: item.groupe_exercice
});

export const useExercices = () => {
  const [exercices, setExercices] = useState<ExerciceReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadExercices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch reference exercises from Supabase
      const { data: referenceExercicesData, error: referenceError } = await supabase
        .from('exercices_reference')
        .select('id, nom, categorie, groupe_exercice')
        .order('nom');

      if (referenceError) {
        throw new Error(`Erreur lors du chargement des exercices de référence: ${referenceError.message}`);
      }

      // Fetch custom exercises from Supabase
      // On ne charge les exercices personnalisés que si un utilisateur est connecté
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let customExercicesData: any[] = [];
      if (user) {
        const { data, error: customError } = await supabase
          .from('exercices_personnalises')
          .select('id, nom, categorie, creator_id, groupe_exercice')
          .eq('creator_id', user.id); // On filtre, bien que la RLS devrait déjà le faire, c'est plus sûr

        if (customError) {
          throw new Error(`Erreur lors du chargement des exercices personnalisés: ${customError.message}`);
        }
        customExercicesData = data || [];
      }

      const referenceExercices = (referenceExercicesData || []).map((item) => mapSupabaseToExerciceReference(item, 'reference'));
      const customExercices = customExercicesData.map((item) => mapSupabaseToExerciceReference(item, 'custom'));

      // Combine reference and custom exercises
      // On peut trier le tout par nom alphabétique
      const allExercices = [...referenceExercices, ...customExercices].sort((a, b) => a.nom.localeCompare(b.nom));

      setExercices(allExercices);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue.';
      console.error("Erreur lors du chargement des exercices:", err);
      setError(errorMessage);
      // En cas d'erreur, on garde peut-être les anciens exercices ? Pour l'instant on vide.
      // setExercices([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadExercices();
  }, [loadExercices]);

  const createCustomExercise = async (nom: string, categorie: string) => {
    if (!user) {
      throw new Error("Vous devez être connecté pour créer un exercice.");
    }

    try {
      const newExercise = {
        nom,
        categorie,
        creator_id: user.id,
        groupe_exercice: 'Global' // Valeur par défaut comme demandé
      };

      const { data, error } = await supabase
        .from('exercices_personnalises')
        .insert(newExercise)
        .select()
        .single();

      if (error) throw error;

      // Mise à jour optimiste/locale
      const createdExercise = mapSupabaseToExerciceReference(data, 'custom');
      setExercices(prev => [...prev, createdExercise].sort((a, b) => a.nom.localeCompare(b.nom)));

      return createdExercise;
    } catch (err: unknown) {
      console.error("Erreur lors de la création de l'exercice:", err);
      throw err;
    }
  };

  const deleteCustomExercise = async (id: string) => {
    if (!user) {
      throw new Error("Vous devez être connecté pour supprimer un exercice.");
    }

    try {
      const { error } = await supabase
        .from('exercices_personnalises')
        .delete()
        .eq('id', id)
        .eq('creator_id', user.id); // Sécurité supplémentaire

      if (error) throw error;

      // Mise à jour locale
      setExercices(prev => prev.filter(ex => ex.id !== id));

    } catch (err: unknown) {
      console.error("Erreur lors de la suppression de l'exercice:", err);
      throw err;
    }
  };

  return {
    exercices,
    loading,
    error,
    loadExercices,
    createCustomExercise,
    deleteCustomExercise
  };
};
