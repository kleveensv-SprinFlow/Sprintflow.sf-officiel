import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Objectif } from '../types';

interface ObjectifState {
  objectif: Objectif | null;
  loading: boolean;
  error: string | null;
  fetchObjectif: (userId: string) => Promise<void>;
  setObjectif: (objectifData: Omit<Objectif, 'id' | 'created_at' | 'user_id'>, userId: string) => Promise<void>;
  updateObjectif: (objectifId: string, updatedData: Partial<Omit<Objectif, 'id' | 'created_at' | 'user_id'>>) => Promise<void>;
  deleteObjectif: (objectifId: string) => Promise<void>;
}

const useObjectif = create<ObjectifState>((set) => ({
  objectif: null,
  loading: false,
  error: null,

  fetchObjectif: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('objectifs')
        .select(`
          *,
          exercice:exercices_reference(*)
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      set({ objectif: data, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
      console.error("Erreur lors de la récupération de l'objectif:", error);
      set({ error: message, loading: false });
    }
  },

  setObjectif: async (objectifData, userId) => {
    set({ loading: true, error: null });
    try {
      // Vérifier s'il existe déjà un objectif pour cet utilisateur
      const { data: existingObjectif, error: fetchError } = await supabase
        .from('objectifs')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: no rows found
        throw fetchError;
      }
      
      let objectifResult;

      if (existingObjectif) {
        // Mettre à jour l'objectif existant
        const { data, error } = await supabase
          .from('objectifs')
          .update({
            exercice_id: objectifData.exercice_id,
            valeur: objectifData.valeur,
          })
          .eq('user_id', userId)
          .select(`
            *,
            exercice:exercices_reference(*)
          `)
          .single();
        if (error) throw error;
        objectifResult = data;
        
      } else {
        // Créer un nouvel objectif
        const { data, error } = await supabase
          .from('objectifs')
          .insert({
            user_id: userId,
            exercice_id: objectifData.exercice_id,
            valeur: objectifData.valeur,
          })
          .select(`
            *,
            exercice:exercices_reference(*)
          `)
          .single();
        if (error) throw error;
        objectifResult = data;
      }
      
      set({ objectif: objectifResult, loading: false });

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
      console.error("Erreur lors de la définition de l'objectif:", error);
      set({ error: message, loading: false });
    }
  },

  updateObjectif: async (objectifId, updatedData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('objectifs')
        .update(updatedData)
        .eq('id', objectifId)
        .select(`
          *,
          exercice:exercices_reference(*)
        `)
        .single();
      
      if (error) throw error;
      set({ objectif: data, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
      console.error("Erreur lors de la mise à jour de l'objectif:", error);
      set({ error: message, loading: false });
    }
  },

  deleteObjectif: async (objectifId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('objectifs')
        .delete()
        .eq('id', objectifId);

      if (error) throw error;
      set({ objectif: null, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
      console.error("Erreur lors de la suppression de l'objectif:", error);
      set({ error: message, loading: false });
    }
  },
}));

export default useObjectif;