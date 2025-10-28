import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Updated interface to match the new DB schema
export interface ExerciceReference {
  id: string;
  nom_fr: string;
  categorie: string;
  groupe_analyse: string | null;
  qualite_cible: string;
  unite: string;
  ratio_base: number | null;
  ratio_avance: number;
  ratio_elite: number;
}

// Updated categories to match the seeded data
export const CATEGORIES = {
  'Haltérophilie': 'Haltérophilie',
  'Muscu. Bas': 'Musculation Bas du Corps',
  'Muscu. Haut': 'Musculation Haut du Corps',
  'Unilatéral': 'Unilatéral',
  'Pliométrie': 'Pliométrie',
  'Lancers': 'Lancers',
};

export function useExercices() {
  const [exercices, setExercices] = useState<ExerciceReference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercices();
  }, []);

  const loadExercices = async () => {
    try {
      // Fetches from the new 'exercices_reference' table
      const { data, error } = await supabase
        .from('exercices_reference')
        .select('*')
        .order('nom_fr');

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
      return ex.nom_fr.toLowerCase().includes(normalizedQuery);
    });

    return results.sort((a, b) => {
      const aStartsWith = a.nom_fr.toLowerCase().startsWith(normalizedQuery);
      const bStartsWith = b.nom_fr.toLowerCase().startsWith(normalizedQuery);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      return a.nom_fr.localeCompare(b.nom_fr);
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