import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// Définition du type pour le profil utilisateur, plus précis.
type UserProfile = {
  id: string;
  role: 'coach' | 'athlete' | 'developer';
  full_name: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

// Définition du type pour les métadonnées à l'inscription.
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
   * Récupère le profil de l'utilisateur depuis la base de données.
   */
  const fetchUserProfile = useCallback(async (user: User) => {
    console.log('📡 [fetchUserProfile] Chargement du profil pour:', user.id);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, first_name, last_name, role, avatar_url')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('❌ [fetchUserProfile] Erreur critique:', error);
      throw new Error("Impossible de charger votre profil. Une erreur est survenue.");
    }
    
    console.log('✅ [fetchUserProfile] Profil chargé:', data);
    return data as UserProfile;
  }, []);

  /**
   * Effet principal qui écoute les changements d'état d'authentification.
   */
  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 [useAuth] Événement:', event);
      try {
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user);
          setUser(session.user);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
        setError(null);
      } catch (e: any) {
        console.error("❌ Erreur dans onAuthStateChange:", e);
        setError(e.message || "Une erreur d'authentification est survenue.");
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  /**
   * Gère la connexion de l'utilisateur.
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email ou mot de passe incorrect.');
      }
      throw new Error(error.message || 'Erreur lors de la connexion.');
    }
  };

  /**
   * Gère l'inscription et la création du profil.
   */
  const signUp = async (email: string, password: string, metaData: SignUpMetadata) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
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
    console.log('✅ [signUp] Utilisateur créé dans Auth:', authData.user.id);

    // Vérifier que la session est bien établie
    if (!authData.session) {
      throw new Error("La session n'a pas pu être établie.");
    }

    // IMPORTANT: Définir explicitement la session dans le client Supabase
    // pour que le token JWT soit disponible pour les requêtes suivantes
    await supabase.auth.setSession({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
    });

    // Mapper 'encadrant' vers 'coach' pour correspondre à la contrainte DB
    const dbRole = metaData.role === 'encadrant' ? 'coach' : 'athlete';

    // Créer le profil (full_name est généré automatiquement)
    // La session est maintenant active dans le client, auth.uid() sera disponible pour RLS
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: metaData.first_name,
        last_name: metaData.last_name,
        role: dbRole,
        role_specifique: metaData.role_specifique,
        date_de_naissance: metaData.date_de_naissance,
        discipline: metaData.discipline,
        sexe: metaData.sexe,
        email: email,
      });

    if (profileError) {
      console.error("❌ ERREUR CRITIQUE [signUp]: Impossible de créer le profil.", profileError);
      throw new Error("Une erreur est survenue lors de la finalisation de votre profil. Veuillez réessayer.");
    }

    console.log('✅ [signUp] Profil créé en base de données.');
  };

  /**
   * Gère la déconnexion.
   */
  const signOut = async () => {
    console.log('🚪 [signOut] Déconnexion...');
    await supabase.auth.signOut();
    window.location.href = '/';
  };
  
  /**
   * Permet de renvoyer l'email de confirmation.
   */
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