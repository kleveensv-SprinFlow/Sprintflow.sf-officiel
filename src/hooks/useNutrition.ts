import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RecettePersonnelle } from '../types';

export interface ObjectifPreset {
  id: string;
  athlete_id: string;
  type_jour: 'haut' | 'bas' | 'repos';
  kcal_objectif: number;
  proteines_objectif_g: number;
  glucides_objectif_g: number;
  lipides_objectif_g: number;
  created_at: string;
  updated_at: string;
}

export interface DonneesCorporelles {
  id: string;
  athlete_id: string;
  date: string;
  poids_kg: number;
  masse_grasse_pct?: number;
  masse_musculaire_kg?: number;
  muscle_squelettique_kg?: number;
  created_at: string;
}

export interface AlimentFavori {
  id: string;
  athlete_id: string;
  nom: string;
  kcal_100g: number;
  proteines_100g: number;
  glucides_100g: number;
  lipides_100g: number;
  fibres_100g?: number;
  sodium_100mg?: number;
  potassium_100mg?: number;
  source_type?: 'off' | 'personnel' | 'recette';
  source_id?: string;
  created_at: string;
}

export interface AlimentPersonnel {
  id: string;
  athlete_id: string;
  nom: string;
  kcal_100g: number;
  proteines_100g: number;
  glucides_100g: number;
  lipides_100g: number;
  fibres_100g?: number;
  sodium_100mg?: number;
  potassium_100mg?: number;
  created_at: string;
}


export interface JournalAlimentaire {
  id: string;
  athlete_id: string;
  date: string;
  tag_moment?: 'pre_entrainement' | 'post_entrainement' | 'repas_1' | 'repas_2' | 'repas_3' | 'collation' | 'pre_sommeil' | 'autres';
  aliment_nom: string;
  quantite_g: number;
  kcal: number;
  proteines_g: number;
  glucides_g: number;
  lipides_g: number;
  fibres_g?: number;
  sodium_mg?: number;
  potassium_mg?: number;
  hydratation_ml?: number;
  created_at: string;
}

export function useNutrition(selectedDate?: string) {
  const [objectifs, setObjectifs] = useState<ObjectifPreset[]>([]);
  const [favoris, setFavoris] = useState<AlimentFavori[]>([]);
  const [alimentsPersonnels, setAlimentsPersonnels] = useState<AlimentPersonnel[]>([]);
  const [recettes, setRecettes] = useState<RecettePersonnelle[]>([]);
  const [journalToday, setJournalToday] = useState<JournalAlimentaire[]>([]);
  const [donneesCorpo, setDonneesCorpo] = useState<DonneesCorporelles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateToUse = selectedDate || new Date().toISOString().split('T')[0];

      await Promise.all([
        loadObjectifs(user.id),
        loadFavoris(user.id),
        loadAlimentsPersonnels(user.id),
        loadRecettes(user.id),
        loadJournalToday(user.id, dateToUse),
        loadDonneesCorpo(user.id),
      ]);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadObjectifs = async (userId: string) => {
    const { data, error } = await supabase
      .from('objectifs_presets')
      .select('*')
      .eq('athlete_id', userId);

    if (error) throw error;
    const normalizedData = (data || []).map(item => ({
      ...item,
      kcal_objectif: Number(item.kcal_objectif),
      proteines_objectif_g: Number(item.proteines_objectif_g),
      glucides_objectif_g: Number(item.glucides_objectif_g),
      lipides_objectif_g: Number(item.lipides_objectif_g),
    }));
    setObjectifs(normalizedData);
  };

  const loadFavoris = async (userId: string) => {
    const { data, error } = await supabase
      .from('aliments_favoris')
      .select('*')
      .eq('athlete_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const normalizedData = (data || []).map(item => ({
      ...item,
      kcal_100g: Number(item.kcal_100g),
      proteines_100g: Number(item.proteines_100g),
      glucides_100g: Number(item.glucides_100g),
      lipides_100g: Number(item.lipides_100g),
      fibres_100g: item.fibres_100g ? Number(item.fibres_100g) : undefined,
      sodium_100mg: item.sodium_100mg ? Number(item.sodium_100mg) : undefined,
      potassium_100mg: item.potassium_100mg ? Number(item.potassium_100mg) : undefined,
    }));
    setFavoris(normalizedData);
  };

  const loadAlimentsPersonnels = async (userId: string) => {
    const { data, error } = await supabase
      .from('aliments_personnels')
      .select('*')
      .eq('athlete_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const normalizedData = (data || []).map(item => ({
      ...item,
      kcal_100g: Number(item.kcal_100g),
      proteines_100g: Number(item.proteines_100g),
      glucides_100g: Number(item.glucides_100g),
      lipides_100g: Number(item.lipides_100g),
      fibres_100g: item.fibres_100g ? Number(item.fibres_100g) : undefined,
      sodium_100mg: item.sodium_100mg ? Number(item.sodium_100mg) : undefined,
      potassium_100mg: item.potassium_100mg ? Number(item.potassium_100mg) : undefined,
    }));
    setAlimentsPersonnels(normalizedData);
  };

  const loadRecettes = async (userId: string) => {
    const { data, error } = await supabase
      .from('recettes_personnelles')
      .select('*')
      .eq('athlete_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const normalizedData = (data || []).map(item => ({
      ...item,
      poids_total_recette_g: Number(item.poids_total_recette_g),
      kcal_total: Number(item.kcal_total),
      proteines_total_g: Number(item.proteines_total_g),
      glucides_total_g: Number(item.glucides_total_g),
      lipides_total_g: Number(item.lipides_total_g),
      fibres_total_g: item.fibres_total_g ? Number(item.fibres_total_g) : undefined,
      sodium_total_mg: item.sodium_total_mg ? Number(item.sodium_total_mg) : undefined,
      potassium_total_mg: item.potassium_total_mg ? Number(item.potassium_total_mg) : undefined,
    }));
    setRecettes(normalizedData);
  };

  const loadJournalToday = async (userId: string, date: string) => {
    const { data, error } = await supabase
      .from('journal_alimentaire')
      .select('*')
      .eq('athlete_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;
    const normalizedData = (data || []).map(item => ({
      ...item,
      quantite_g: Number(item.quantite_g),
      kcal: Number(item.kcal),
      proteines_g: Number(item.proteines_g),
      glucides_g: Number(item.glucides_g),
      lipides_g: Number(item.lipides_g),
      fibres_g: item.fibres_g ? Number(item.fibres_g) : undefined,
      sodium_mg: item.sodium_mg ? Number(item.sodium_mg) : undefined,
      potassium_mg: item.potassium_mg ? Number(item.potassium_mg) : undefined,
      hydratation_ml: item.hydratation_ml ? Number(item.hydratation_ml) : undefined,
    }));
    setJournalToday(normalizedData);
  };

  const loadDonneesCorpo = async (userId: string) => {
    const { data, error } = await supabase
      .from('donnees_corporelles')
      .select('*')
      .eq('athlete_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    const normalizedData = (data || []).map(item => ({
      ...item,
      poids_kg: Number(item.poids_kg),
      masse_grasse_pct: item.masse_grasse_pct ? Number(item.masse_grasse_pct) : undefined,
      masse_musculaire_kg: item.masse_musculaire_kg ? Number(item.masse_musculaire_kg) : undefined,
      muscle_squelettique_kg: item.muscle_squelettique_kg ? Number(item.muscle_squelettique_kg) : undefined,
    }));
    setDonneesCorpo(normalizedData);
  };

  const createOrUpdateObjectif = async (objectif: Omit<ObjectifPreset, 'id' | 'athlete_id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('objectifs_presets')
      .upsert({
        athlete_id: user.id,
        ...objectif,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'athlete_id,type_jour',
      })
      .select()
      .single();

    if (error) throw error;
    await loadObjectifs(user.id);
    return data;
  };

  const addDonneesCorporelles = async (donnees: Omit<DonneesCorporelles, 'id' | 'athlete_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('donnees_corporelles')
      .upsert({
        athlete_id: user.id,
        ...donnees,
      }, {
        onConflict: 'athlete_id,date',
      })
      .select()
      .single();

    if (error) throw error;
    await loadDonneesCorpo(user.id);
    return data;
  };

  const addToFavoris = async (aliment: Omit<AlimentFavori, 'id' | 'athlete_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('aliments_favoris')
      .insert({
        athlete_id: user.id,
        ...aliment,
      })
      .select()
      .single();

    if (error) throw error;
    await loadFavoris(user.id);
    return data;
  };

  const removeFromFavoris = async (id: string) => {
    const { error } = await supabase
      .from('aliments_favoris')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setFavoris(favoris.filter(f => f.id !== id));
  };

  const isFavorite = (nom: string, sourceType?: string, sourceId?: string): AlimentFavori | null => {
    return favoris.find(f =>
      f.nom === nom &&
      f.source_type === sourceType &&
      (sourceId ? f.source_id === sourceId : true)
    ) || null;
  };

  const createAlimentPersonnel = async (aliment: Omit<AlimentPersonnel, 'id' | 'athlete_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('aliments_personnels')
      .insert({
        athlete_id: user.id,
        ...aliment,
      })
      .select()
      .single();

    if (error) throw error;
    await loadAlimentsPersonnels(user.id);
    return data;
  };

  const createRecette = async (recette: Omit<RecettePersonnelle, 'id' | 'athlete_id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('recettes_personnelles')
      .insert({
        athlete_id: user.id,
        ...recette,
      })
      .select()
      .single();

    if (error) throw error;
    await loadRecettes(user.id);
    return data;
  };

  const addToJournal = async (entry: Omit<JournalAlimentaire, 'id' | 'athlete_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('journal_alimentaire')
      .insert({
        athlete_id: user.id,
        ...entry,
      })
      .select()
      .single();

    if (error) throw error;

    if (entry.date === new Date().toISOString().split('T')[0]) {
      await loadJournalToday(user.id, entry.date);
    }

    return data;
  };

  const deleteFromJournal = async (id: string) => {
    const { error } = await supabase
      .from('journal_alimentaire')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setJournalToday(journalToday.filter(j => j.id !== id));
  };

  return {
    objectifs,
    favoris,
    alimentsPersonnels,
    recettes,
    journalToday,
    donneesCorpo,
    loading,
    createOrUpdateObjectif,
    addDonneesCorporelles,
    addToFavoris,
    removeFromFavoris,
    isFavorite,
    createAlimentPersonnel,
    createRecette,
    addToJournal,
    deleteFromJournal,
    refreshData: loadData,
  };
}
