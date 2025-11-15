import React, { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types';
import { logger } from '../utils/logger';

const PROFILE_COLUMNS = 'id, full_name, first_name, last_name, role, photo_url';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isInitialized: boolean;
  isProfileLoaded: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthReady: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updatedProfileData: Partial<Profile>) => void;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<any>;
  resendConfirmationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createEmptyAuthState = (): AuthState => ({
  session: null,
  user: null,
  profile: null,
  isInitialized: false,
  isProfileLoaded: false,
});

const createAuthState = (session: Session | null, user: User | null, profile: Profile | null, isInitialized: boolean, isProfileLoaded: boolean = true): AuthState => ({
  session,
  user,
  profile,
  isInitialized,
  isProfileLoaded,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(createEmptyAuthState());
  const isMountedRef = useRef(true);

  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    logger.info('[useAuth] Début du chargement du profil pour:', userId);
    logger.info('[useAuth] Colonnes demandées:', PROFILE_COLUMNS);

    try {
      // Créer un timeout de 15 secondes pour détecter les requêtes bloquées
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: La requête Supabase n\'a pas répondu dans les 15 secondes'));
        }, 15000);
      });

      const queryPromise = supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .maybeSingle();

      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]);

      logger.info('[useAuth] Réponse Supabase reçue. Error:', error, 'Data:', profile);

      if (error) {
        logger.error('[useAuth] Erreur Supabase lors du chargement du profil:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          userId
        });
        return null;
      }

      if (!profile) {
        logger.error('[useAuth] Profil null retourné par Supabase pour l\'utilisateur:', userId);
        logger.error('[useAuth] Cela peut indiquer un problème de permissions RLS ou un profil manquant.');
        return null;
      }

      logger.info('[useAuth] Profil chargé avec succès:', { id: profile.id, role: profile.role, name: profile.full_name });
      return profile;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Timeout')) {
        logger.error('[useAuth] TIMEOUT: La requête Supabase est bloquée. Cela peut être dû à:');
        logger.error('[useAuth] - Cookies tiers bloqués (Third-party cookies)');
        logger.error('[useAuth] - Problème de réseau ou de connectivité');
        logger.error('[useAuth] - Configuration CORS incorrecte');
      } else {
        logger.error('[useAuth] Exception lors du chargement du profil:', error);
      }
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!authState.user) return;
    try {
      const profile = await loadProfile(authState.user.id);
      if (isMountedRef.current) {
        setAuthState(prev => createAuthState(prev.session, prev.user, profile, prev.isInitialized, true));
      }
    } catch (e) {
      logger.error('[useAuth] Erreur lors du rafraîchissement:', e);
    }
  }, [authState.user, loadProfile]);

  const updateProfile = useCallback((updatedProfileData: Partial<Profile>) => {
    setAuthState(prev => {
      if (!prev.profile) return prev;
      return {
        ...prev,
        profile: { ...prev.profile, ...updatedProfileData },
      };
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async (email: string, password: string, profileData: Partial<Profile>) => {
    try {
      const roleMap: Record<string, string> = { 'athlète': 'athlete', 'athlete': 'athlete', 'encadrant': 'coach', 'coach': 'coach' };
      const mappedRole = roleMap[profileData.role?.toLowerCase() || 'athlete'] || 'athlete';
      const redirectUrl = window.location.hostname === 'localhost' ? `${window.location.origin}/` : 'https://sprintflow.one/';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { ...profileData, role: mappedRole }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Aucun utilisateur créé');

      // Le profil sera créé automatiquement par le trigger handle_new_user
      // Pas besoin de l'insérer manuellement

      return data;
    } catch (error) {
      if (error instanceof Error && error.message?.includes('User already registered')) {
        throw new Error('Cet email est déjà utilisé.');
      }
      throw error;
    }
  }, []);

  const resendConfirmationEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    try {
      logger.info('[useAuth] Déconnexion en cours...');
      setAuthState(createEmptyAuthState());
      await supabase.auth.signOut();
      Object.keys(localStorage).forEach(key => { if (key.startsWith('sb-')) localStorage.removeItem(key); });
      logger.info('[useAuth] Déconnexion réussie');
    } catch (error) {
      logger.error('[useAuth] Erreur critique signOut:', error);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const initAuth = async () => {
      try {
        logger.info('[useAuth] Initialisation de l\'authentification');

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logger.warn('[useAuth] Erreur lors de getSession:', error);
        }

        if (!isMountedRef.current) return;

        const currentUser = session?.user ?? null;
        let currentProfile: Profile | null = null;

        if (currentUser) {
          logger.info('[useAuth] Utilisateur authentifié détecté:', { id: currentUser.id, email: currentUser.email });
          currentProfile = await loadProfile(currentUser.id);

          if (!currentProfile) {
            logger.warn('[useAuth] Le profil n\'a pas pu être chargé. L\'utilisateur verra ProfileLoadError.');
          }
        } else {
          logger.info('[useAuth] Aucun utilisateur authentifié trouvé.');
        }

        if (!isMountedRef.current) return;

        setAuthState(createAuthState(session, currentUser, currentProfile, true, true));
        logger.info('[useAuth] Initialisation terminée. User:', !!currentUser, 'Profile:', !!currentProfile);
      } catch (error) {
        logger.error('[useAuth] Erreur critique lors de l\'initialisation:', error);
        if (isMountedRef.current) {
          setAuthState(createAuthState(null, null, null, true, true));
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      logger.info('[useAuth] Événement auth:', event);

      const currentUser = session?.user ?? null;
      let currentProfile: Profile | null = null;

      if (currentUser) {
        logger.info('[useAuth] Chargement du profil suite à l\'événement auth:', event);
        currentProfile = await loadProfile(currentUser.id);

        if (!currentProfile) {
          logger.warn('[useAuth] Le profil n\'a pas pu être chargé après l\'événement:', event);
        }
      }

      if (!isMountedRef.current) return;

      setAuthState(createAuthState(session, currentUser, currentProfile, true, true));
      logger.info('[useAuth] État mis à jour après événement. User:', !!currentUser, 'Profile:', !!currentProfile);
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const loading = !authState.isInitialized;
  const isAuthReady = authState.isInitialized && authState.isProfileLoaded;

  const contextValue = React.useMemo(
    () => ({
      session: authState.session,
      user: authState.user,
      profile: authState.profile,
      loading,
      isAuthReady,
      refreshProfile,
      updateProfile,
      signOut,
      signIn,
      signUp,
      resendConfirmationEmail,
    }),
    [authState, loading, isAuthReady, refreshProfile, updateProfile, signOut, signIn, signUp, resendConfirmationEmail]
  );

  return (<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    logger.error('[useAuth] Context is undefined! This should never happen.');
    logger.error('[useAuth] Make sure AuthProvider is mounted in main.tsx');
    return {
      session: null,
      user: null,
      profile: null,
      loading: true,
      isAuthReady: false,
      refreshProfile: async () => {},
      updateProfile: () => {},
      signOut: async () => {},
      signIn: async () => ({ user: null, session: null }),
      signUp: async () => ({ user: null, session: null }),
      resendConfirmationEmail: async () => {}
    };
  }
  return context;
};

export default useAuth;
