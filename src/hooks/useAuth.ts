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
   * Utilise maybeSingle() et retry pour gérer le délai de création du profil par le trigger.
   */
  const fetchUserProfile = useCallback(async (user: User, retryCount = 0): Promise<UserProfile> => {
    console.log('📡 [fetchUserProfile] Chargement du profil pour:', user.id);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, first_name, last_name, role, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('❌ [fetchUserProfile] Erreur critique:', error);
      throw new Error("Impossible de charger votre profil. Une erreur est survenue.");
    }

    // Si le profil n'existe pas encore (trigger en cours), attendre et réessayer
    if (!data && retryCount < 3) {
      console.log(`⏳ [fetchUserProfile] Profil pas encore créé, retry ${retryCount + 1}/3...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchUserProfile(user, retryCount + 1);
    }

    if (!data) {
      console.error('❌ [fetchUserProfile] Profil introuvable après 3 tentatives');
      throw new Error("Votre profil n'a pas pu être créé. Veuillez contacter le support.");
    }

    console.log('✅ [fetchUserProfile] Profil chargé:', data);
    return data as UserProfile;
  }, []);

  /**
   * Effet principal qui charge la session initiale puis écoute les changements.
   */
  useEffect(() => {
    let mounted = true;
    let isProcessing = false;

    // 1. Charger la session existante au démarrage
    const initAuth = async () => {
      console.log('🔄 [useAuth] Initialisation...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('❌ [useAuth] Erreur getSession:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('📡 [useAuth] Session existante trouvée:', session.user.id);
          console.log('📡 [useAuth] Token:', session.access_token?.substring(0, 20) + '...');

          // Utiliser fetch directement pour contourner les problèmes du client Supabase
          try {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}&select=id,full_name,first_name,last_name,role,avatar_url`,
              {
                headers: {
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=representation'
                }
              }
            );

            console.log('📡 [useAuth] Réponse fetch:', response.status);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ [useAuth] Erreur fetch:', response.status, errorText);
              throw new Error(`Erreur ${response.status}: ${errorText}`);
            }

            const profileData = await response.json();
            console.log('📡 [useAuth] Données reçues:', profileData);

            if (!mounted) return;

            if (profileData && profileData.length > 0) {
              console.log('✅ [useAuth] Profil chargé:', profileData[0]);
              setUser(session.user);
              setProfile(profileData[0] as UserProfile);
            } else {
              console.warn('⚠️ [useAuth] Aucun profil trouvé');
            }
          } catch (fetchError: any) {
            console.error('❌ [useAuth] Erreur fetch profil:', fetchError);
          }
        }
      } catch (e: any) {
        console.error('❌ [useAuth] Erreur init:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // 2. Écouter les changements d'état
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 [useAuth] Événement:', event);

      if (!mounted || isProcessing) {
        console.log('⏭️ [useAuth] Ignoré (mounted=' + mounted + ', processing=' + isProcessing + ')');
        return;
      }

      isProcessing = true;

      try {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        } else if (session?.user) {
          console.log('📡 [useAuth] Chargement profil:', session.user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, first_name, last_name, role, avatar_url')
            .eq('id', session.user.id)
            .maybeSingle();

          if (mounted) {
            if (error) {
              console.error('❌ [useAuth] Erreur profil:', error);
            } else if (data) {
              console.log('✅ [useAuth] Profil chargé:', data);
              setUser(session.user);
              setProfile(data as UserProfile);
            }
          }
        }
      } catch (e: any) {
        console.error('❌ [useAuth] Erreur:', e);
      } finally {
        isProcessing = false;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
    // Envoyer les métadonnées dans le champ 'data' de signUp
    // Le trigger PostgreSQL créera automatiquement le profil
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

    console.log('✅ [signUp] Utilisateur créé dans Auth:', authData.user.id);
    console.log('✅ [signUp] Le profil sera créé automatiquement par le trigger PostgreSQL');
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