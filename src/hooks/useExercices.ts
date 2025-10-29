import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ExerciceReference {
  id: string;
  nom: string;
  nom_alternatif: string[] | null;
  categorie: string;
  groupe_exercice: string | null;
  bareme_intermediaire: number | null;
  bareme_avance: number | null;
  bareme_elite: number | null;
  description: string | null;
  created_at: string;
}

export const CATEGORIES = {
  'halterophilie': 'Haltérophilie',
  'muscu_bas': 'Musculation Bas du Corps',
  'muscu_haut': 'Musculation Haut du Corps',
  'unilateral': 'Unilatéral',
  'pliometrie': 'Pliométrie',
  'lancers': 'Lancers',
};

export function useExercices() {
  const [exercices, setExercices] = useState<ExerciceReference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercices();
  }, []);

  const loadExercices = async () => {
    try {
      const { data, error } = await supabase
        .from('exercices_reference')
        .select('*')
        .order('nom');

      if (error) throw error;
      setExercices(data || []);
    } catch (error) {
      console.error('Error loading exercices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExercicesByCategorie = (categorie: string) => {
    return exercices.filter(ex => ex.categorie === categorie);
  };

  const searchExercices = (query: string, categorie?: string) => {
    const normalizedQuery = query.toLowerCase().trim();

    let filtered = categorie
      ? exercices.filter(ex => ex.categorie === categorie)
      : exercices;

    if (!normalizedQuery) return filtered;

    const results = filtered.filter(ex => {
      const matchesNom = ex.nom.toLowerCase().includes(normalizedQuery);
      const matchesAlternatif = ex.nom_alternatif?.some(alt =>
        alt.toLowerCase().includes(normalizedQuery)
      );
      return matchesNom || matchesAlternatif;
    });

    return results.sort((a, b) => {
      const aStartsWith = a.nom.toLowerCase().startsWith(normalizedQuery);
      const bStartsWith = b.nom.toLowerCase().startsWith(normalizedQuery);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      return a.nom.localeCompare(b.nom);
    });
  };

  const getExerciceById = (id: string) => {
    return exercices.find(ex => ex.id === id);
  };

  // The calculateScore function is removed, as this logic is now on the backend.

  return {
    exercices,
    loading,
    loadExercices,
    getExercicesByCategorie,
    searchExercices,
    getExerciceById,
  };
}