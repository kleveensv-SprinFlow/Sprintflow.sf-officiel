import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

type UserProfile = {
  id: string;
  role: 'coach' | 'athlete' | 'developer';
  full_name: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

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

  const fetchUserProfile = useCallback(async (user: User, retryCount = 0): Promise<UserProfile> => {
    console.log(`📡 [useAuth] Chargement du profil pour: ${user.id}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, first_name, last_name, role, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('❌ [useAuth] Erreur critique lors du chargement du profil:', error);
      throw new Error("Impossible de charger votre profil. Une erreur est survenue.");
    }

    if (!data && retryCount < 3) {
      console.warn(`⏳ [useAuth] Profil non trouvé, nouvel essai dans 1s (essai ${retryCount + 1}/3)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchUserProfile(user, retryCount + 1);
    }

    if (!data) {
      console.error('❌ [useAuth] Profil introuvable après 3 tentatives.');
      throw new Error("Votre profil n'a pas pu être créé ou trouvé. Veuillez contacter le support.");
    }

    console.log('✅ [useAuth] Profil chargé:', data);
    return data as UserProfile;
  }, []);

  useEffect(() => {
    let mounted = true;
    console.log('🔄 [useAuth] Initialisation du listener...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (!mounted) return;
        console.log(`🔐 [useAuth] Événement reçu: ${event}`);

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const userProfile = await fetchUserProfile(currentUser);
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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metaData.first_name,
          last_name: metaData.last_name,
          role: metaData.role,
          role_specifique: metaData.role_specifique,
          date_de_naissance: metaData.date_de_naissance,
          discipline: metaData.discipline,
          sexe: metaData.sexe,
        }
      }
    });

    if (authError) {
      if (authError.message.includes('User already registered')) {
        throw new Error('Un utilisateur avec cet email existe déjà.');
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error("L'inscription a échoué, aucun utilisateur n'a été créé.");
    }
  };

  const signOut = async () => {
    console.log('🚪 [useAuth] Déconnexion...');
    await supabase.auth.signOut();
  };

  const resendConfirmationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) throw error;
  };

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resendConfirmationEmail
  };
}

export default useAuth;
