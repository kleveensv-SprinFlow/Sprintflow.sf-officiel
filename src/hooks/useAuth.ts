import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

type UserProfile = {
  id: string;
  role: 'coach' | 'athlete' | 'developer';
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (user: User, signal?: AbortSignal) => {
    console.log('📡 [fetchUserProfile] Début chargement pour user:', user.id);

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id);

    if (signal) {
      query = query.abortSignal(signal);
    }

    console.log('📡 [fetchUserProfile] Envoi requête Supabase...');
    const { data, error } = await query.maybeSingle();
    console.log('📡 [fetchUserProfile] Réponse reçue - data:', !!data, 'error:', error?.message);

    if (error) {
      if (error.name === 'AbortError') {
        console.log('📡 [fetchUserProfile] Requête annulée (AbortError)');
        throw error;
      }
      console.warn('⚠️ Erreur lors du chargement du profil:', error.message);
    }

    if (!data) {
      console.warn('⚠️ Profil non trouvé, utilisation des métadonnées');
      // Fallback sur les métadonnées si le profil n'existe pas encore
      const fallback = {
        id: user.id,
        role: (user.id === '75a17559-b45b-4dd1-883b-ce8ccfe03f0f' ? 'developer' :
              user.user_metadata?.role || 'athlete') as 'coach' | 'athlete' | 'developer',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || ''
      };
      console.log('📡 [fetchUserProfile] Retour fallback:', fallback);
      return fallback;
    }

    const profile = {
      ...data,
      avatar_url: data.photo_url || data.avatar_url // Compatibilité photo_url/avatar_url
    };
    console.log('📡 [fetchUserProfile] Retour profile DB:', profile);
    return profile;
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    let mounted = true;
    let authChangeHandled = false;
    let isSigningOut = false; // Protection contre la boucle infinie
    let hasCheckedInitialSession = false; // Pour éviter de vérifier plusieurs fois

    // Nettoyer la session initiale si l'email n'est pas confirmé
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !session.user.email_confirmed_at) {
          console.warn('⚠️ Session existante avec email non confirmé, nettoyage...');
          await supabase.auth.signOut();
          if (mounted) {
            setError("Veuillez confirmer votre email avant de vous connecter.");
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session initiale:', error);
      }
    };

    checkInitialSession();

    // onAuthStateChange gère maintenant l'état initial,
    // donc initAuth peut être retiré pour éviter la redondance.
    // Le setLoading(false) est garanti par le `finally` dans le listener.

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 [useAuth] Auth state change:', event, session?.user?.email);
      authChangeHandled = true;

      // Ignorer les événements pendant qu'on se déconnecte
      if (isSigningOut && event === 'SIGNED_IN') {
        console.log('⏭️ Événement SIGNED_IN ignoré (déconnexion en cours)');
        return;
      }

      try {
        switch (event) {
          case 'INITIAL_SESSION':
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (session?.user && mounted) {
              console.log(`🔄 [${event}] Traitement de la session...`);

              // Vérifier si l'email est confirmé
              if (!session.user.email_confirmed_at) {
                console.warn('⚠️ Email non confirmé, déconnexion...');
                isSigningOut = true;
                await supabase.auth.signOut();
                if (mounted) {
                  setError("Veuillez confirmer votre email avant de vous connecter.");
                  setUser(null);
                  setProfile(null);
                  setLoading(false);
                }
                setTimeout(() => { isSigningOut = false; }, 1000);
                return;
              }

              console.log('✅ Email confirmé, chargement du profil...');
              setUser(session.user);
              try {
                const userProfile = await fetchUserProfile(session.user);
                console.log('👤 Profil récupéré:', userProfile);
                if (mounted) {
                  setProfile(userProfile);
                  setError(null);
                  console.log('✅ User et profile définis dans le state');
                }
              } catch (profileError: any) {
                console.error('❌ Erreur lors du chargement du profil:', profileError);
                if (mounted && profileError.name !== 'AbortError') {
                  const fallbackProfile = {
                    id: session.user.id,
                    role: session.user.user_metadata?.role || 'athlete',
                    first_name: session.user.user_metadata?.first_name || '',
                    last_name: session.user.user_metadata?.last_name || '',
                    email: session.user.email || '',
                  };
                  setProfile(fallbackProfile as UserProfile);
                  console.log('⚠️ Profil fallback utilisé:', fallbackProfile);
                }
              }
            } else if (!session && mounted && event === 'INITIAL_SESSION') {
              // Pas de session au démarrage = utilisateur non connecté
              console.log('ℹ️ Aucune session existante');
              setUser(null);
              setProfile(null);
              setError(null);
            }
            break;

          case 'SIGNED_OUT':
            console.log('🚪 [SIGNED_OUT] Événement de déconnexion reçu');
            if (mounted) {
              setUser(null);
              setProfile(null);
              setError(null);
            }
            break;

          default:
            console.log('ℹ️ Événement non géré:', event);
            break;
        }
      } catch (error: any) {
        console.error("❌ Erreur dans onAuthStateChange:", error);
        if (mounted) {
          setError(error?.message || "Impossible de mettre à jour la session.");
          setUser(null);
          setProfile(null);
        }
      } finally {
        // Quoi qu'il arrive, on arrête de charger.
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      controller.abort();
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.');
        }
        throw new Error('Email ou mot de passe incorrect');
      }

      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error('Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metaData: object) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: metaData
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      if (error) {
        throw error;
      }

      return { success: true, message: 'Email de confirmation renvoyé avec succès' };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors du renvoi de l\'email');
    }
  };

  const signOut = async () => {
    console.log('🚪 [signOut] Début de la déconnexion...');

    // 1. Déconnexion Supabase d'abord (pour éviter les événements onAuthStateChange)
    try {
      console.log('🔓 [signOut] Déconnexion Supabase...');
      await supabase.auth.signOut({ scope: 'local' });
      console.log('✅ [signOut] Déconnexion Supabase réussie');
    } catch (error: any) {
      console.error('❌ [signOut] Erreur déconnexion Supabase:', error);
    }

    // 2. Nettoyer TOUTES les clés Supabase du localStorage
    console.log('🧹 [signOut] Nettoyage localStorage Supabase...');
    const allKeys = Object.keys(localStorage);
    const supabaseKeys = allKeys.filter(key =>
      key.includes('supabase') ||
      key.includes('sb-kqlzvxfdzandgdkqzggj') ||
      key.includes('sb-ifmoecnlpwnxcthplqra')
    );

    supabaseKeys.forEach(key => {
      console.log('  🗑️ Suppression:', key);
      localStorage.removeItem(key);
    });

    // 3. Nettoyer sessionStorage
    console.log('🧹 [signOut] Nettoyage sessionStorage...');
    sessionStorage.clear();

    // 4. Nettoyer l'état React APRÈS Supabase
    console.log('🧹 [signOut] Nettoyage état React...');
    setUser(null);
    setProfile(null);
    setError(null);
    setLoading(false);

    console.log('✅ [signOut] Déconnexion complète terminée');
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