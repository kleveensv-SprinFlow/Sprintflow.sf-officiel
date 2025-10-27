import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ExerciceReference {
  id: string;
  nom: string;
  nom_alternatif: string[];
  categorie: 'halterophilie' | 'muscu_bas' | 'muscu_haut' | 'unilateral';
  groupe_exercice: string;
  bareme_intermediaire: number;
  bareme_avance: number;
  bareme_elite: number;
  description?: string;
}

export const CATEGORIES = {
  halterophilie: 'Haltérophilie',
  muscu_bas: 'Musculation Bas du Corps',
  muscu_haut: 'Musculation Haut du Corps',
  unilateral: 'Unilatéral',
} as const;

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
      const nomMatch = ex.nom.toLowerCase().includes(normalizedQuery);
      const altMatch = ex.nom_alternatif.some(alt =>
        alt.toLowerCase().includes(normalizedQuery)
      );
      return nomMatch || altMatch;
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

  const calculateScore = (exercice: ExerciceReference, charge: number, poidsCorps: number): number => {
    const ratio = charge / poidsCorps;

    if (ratio >= exercice.bareme_elite) return 100;
    if (ratio >= exercice.bareme_avance) {
      const range = exercice.bareme_elite - exercice.bareme_avance;
      const progress = (ratio - exercice.bareme_avance) / range;
      return 80 + (progress * 20);
    }
    if (ratio >= exercice.bareme_intermediaire) {
      const range = exercice.bareme_avance - exercice.bareme_intermediaire;
      const progress = (ratio - exercice.bareme_intermediaire) / range;
      return 60 + (progress * 20);
    }

    const progress = ratio / exercice.bareme_intermediaire;
    return Math.min(progress * 60, 59);
  };

  return {
    exercices,
    loading,
    getExercicesByCategorie,
    searchExercices,
    getExerciceById,
    calculateScore,
  };
}
