import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface EpreuveAthletisme {
  id: string;
  nom: string;
  categorie: string;
  type_mesure: 'temps' | 'distance' | 'hauteur';
  unite: string;
  created_at: string;
}

export const CATEGORIES_EPREUVES = [
  { key: 'course_sprint', label: 'Sprint' },
  { key: 'course_demi_fond', label: 'Demi-fond' },
  { key: 'course_fond', label: 'Fond' },
  { key: 'course_haies', label: 'Haies' },
  { key: 'saut', label: 'Sauts' },
  { key: 'lancer', label: 'Lancers' },
];

export function useEpreuves() {
  const [epreuves, setEpreuves] = useState<EpreuveAthletisme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEpreuves();
  }, []);

  const loadEpreuves = async () => {
    try {
      const { data, error } = await supabase
        .from('epreuves_athletisme')
        .select('*')
        .order('nom');

      if (error) throw error;
      setEpreuves(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des épreuves:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEpreuvesByCategorie = (categorie: string) => {
    return epreuves.filter(ep => ep.categorie === categorie);
  };

  const getEpreuveById = (id: string) => {
    return epreuves.find(ep => ep.id === id);
  };

  return {
    epreuves,
    categories: CATEGORIES_EPREUVES,
    loading,
    loadEpreuves,
    getEpreuvesByCategorie,
    getEpreuveById,
  };
}

export default useEpreuves;
