import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// Définition du type pour le profil utilisateur
type UserProfile = {
  id: string;
  role: 'coach' | 'athlete' | 'developer';
  full_name: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

// Définition du type pour les métadonnées à l'inscription
type SignUpMetadata = {
  first_name: string;
  last_name: string;
  role: 'athlete' | 'encadrant';
  role_specifique: string;
  date_de_naissance: string | null;
  discipline: string;
  sexe: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère le profil de l'utilisateur en utilisant un fetch direct pour plus de robustesse
   * dans des environnements comme StackBlitz.
   */
  const fetchUserProfile = useCallback(async (user: User, session: any, retryCount = 0): Promise<UserProfile> => {
    console.log(`📡 [useAuth] Chargement du profil pour: ${user.id}`);
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=id,full_name,first_name,last_name,role,avatar_url`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [useAuth] Erreur critique lors du chargement du profil:', errorText);
        throw new Error("Impossible de charger votre profil. Une erreur est survenue.");
    }
    
    const data = await response.json();
    const userProfile = data?.[0];

    if (!userProfile && retryCount < 3) {
      console.warn(`⏳ [useAuth] Profil non trouvé, nouvel essai dans 1s (essai ${retryCount + 1}/3)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchUserProfile(user, session, retryCount + 1);
    }

    if (!userProfile) {
      console.error('❌ [useAuth] Profil introuvable après 3 tentatives.');
      throw new Error("Votre profil n'a pas pu être créé ou trouvé. Veuillez contacter le support.");
    }

    console.log('✅ [useAuth] Profil chargé:', userProfile);
    return userProfile as UserProfile;
  }, []);

  /**
   * Effet principal qui écoute les changements d'état d'authentification.
   */
  useEffect(() => {
    let mounted = true;
    console.log('🔄 [useAuth] Initialisation du listener...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (!mounted) return;
        console.log(`🔐 [useAuth] Événement reçu: ${event}`);

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser && session) {
          const userProfile = await fetchUserProfile(currentUser, session);
          if (mounted) setProfile(userProfile);
        } else {
          if (mounted) setProfile(null);
        }

      } catch (e: any) {
        console.error("❌ [useAuth] Erreur dans le listener d'authentification:", e);
        if (mounted) {
          setError(e.message || "Une erreur d'authentification est survenue.");
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('✅ [useAuth] Fin de traitement, chargement terminé.');
        }
      }
    });

    return () => {
      console.log('🛑 [useAuth] Nettoyage du listener.');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email ou mot de passe incorrect.');
      }
      throw new Error(error.message || 'Erreur lors de la connexion.');
    }
  };

  const signUp = async (email: string, password: string, metaData: SignUpMetadata) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metaData }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('Un utilisateur avec cet email existe déjà.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 [useAuth] Déconnexion...');
    await supabase.auth.signOut();
  };

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };
}

export default useAuth;