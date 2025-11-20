import React, { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types';
import { logger } from '../utils/logger';

const PROFILE_COLS =
  'id,full_name,first_name,last_name,email,role,photo_url,sprinty_mode,discipline,sexe,date_de_naissance,license_number,role_specifique,onboarding_completed,preferred_language';

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
  updateSprintyMode: (newMode: 'simple' | 'expert') => Promise<void>;
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

const createAuthState = (
  session: Session | null,
  user: User | null,
  profile: Profile | null,
  isInitialized: boolean,
  isProfileLoaded: boolean = true
): AuthState => ({
  session,
  user,
  profile,
  isInitialized,
  isProfileLoaded,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(createEmptyAuthState());
  const isMountedRef = useRef(true);

  /**
   * Load profile — VERSION SANS TIMEOUT (stable)
   */
  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    logger.info('[useAuth] Chargement du profil pour:', userId);

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(PROFILE_COLS)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logger.error('[useAuth] Erreur Supabase loadProfile:', error);
        return null;
      }

      if (!profile) {
        logger.warn('[useAuth] Aucun profil trouvé pour:', userId);
        return null;
      }

      logger.info('[useAuth] Profil chargé:', profile.id);
      return profile;
    } catch (e) {
      logger.error('[useAuth] Exception loadProfile:', e);
      return null;
    }
  }, []);

  /**
   * Refresh profile
   */
  const refreshProfile = useCallback(async () => {
    if (!authState.user) return;
    const profile = await loadProfile(authState.user.id);

    if (isMountedRef.current) {
      setAuthState((prev) => createAuthState(prev.session, prev.user, profile, prev.isInitialized, true));
    }
  }, [authState.user, loadProfile]);

  /**
   * Update profile locally
   */
  const updateProfile = useCallback((updatedProfileData: Partial<Profile>) => {
    setAuthState((prev) => {
      if (!prev.profile) return prev;
      return {
        ...prev,
        profile: { ...prev.profile, ...updatedProfileData },
      };
    });
  }, []);

  /**
   * Sprinty Mode
   */
  const updateSprintyMode = useCallback(
    async (newMode: 'simple' | 'expert') => {
      if (!authState.user) return;

      try {
        const { error } = await supabase
          .from('profiles')
          .update({ sprinty_mode: newMode })
          .eq('id', authState.user.id);

        if (error) throw error;

        setAuthState((prev) => {
          if (!prev.profile) return prev;
          return {
            ...prev,
            profile: { ...prev.profile, sprinty_mode: newMode },
          };
        });
      } catch (err) {
        logger.error('[useAuth] Erreur updateSprintyMode:', err);
      }
    },
    [authState.user]
  );

  /**
   * signIn
   */
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  /**
   * signUp
   */
  const signUp = useCallback(async (email: string, password: string, profileData: Partial<Profile>) => {
    const roleMap: Record<string, string> = {
      'athlète': 'athlete',
      athlete: 'athlete',
      encadrant: 'coach',
      coach: 'coach',
    };

    const mappedRole = roleMap[profileData.role?.toLowerCase() || 'athlete'] || 'athlete';

    const redirectUrl = window.location.hostname === 'localhost'
      ? `${window.location.origin}/`
      : 'https://sprintflow.one/';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { ...profileData, role: mappedRole },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Aucun utilisateur créé');

    return data;
  }, []);

  /**
   * resend confirmation email
   */
  const resendConfirmationEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  }, []);

  /**
   * signOut
   */
  const signOut = useCallback(async () => {
    try {
      logger.info('[useAuth] Déconnexion...');
      setAuthState(createEmptyAuthState());
      await supabase.auth.signOut();

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });

      logger.info('[useAuth] Déconnexion OK');
    } catch (e) {
      logger.error('[useAuth] signOut error:', e);
    }
  }, []);

  /**
   * INITIALISATION
   */
  useEffect(() => {
    isMountedRef.current = true;

    const initAuth = async () => {
      logger.info('[useAuth] Initialisation Auth...');

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) logger.warn('[useAuth] getSession error:', error);

      const currentUser = session?.user ?? null;
      let currentProfile: Profile | null = null;

      if (currentUser) {
        currentProfile = await loadProfile(currentUser.id);
      }

      if (!isMountedRef.current) return;

      setAuthState(createAuthState(session, currentUser, currentProfile, true, true));
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      const user = session?.user ?? null;
      const profile = user ? await loadProfile(user.id) : null;

      setAuthState(createAuthState(session, user, profile, true, true));
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
      updateSprintyMode,
      signOut,
      signIn,
      signUp,
      resendConfirmationEmail,
    }),
    [authState, loading, isAuthReady, refreshProfile, updateProfile, signOut, signIn, signUp, resendConfirmationEmail]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

/**
 * HOOK
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    logger.error('[useAuth] AuthContext non trouvé');
    return {
      session: null,
      user: null,
      profile: null,
      loading: true,
      isAuthReady: false,
      refreshProfile: async () => {},
      updateProfile: () => {},
      updateSprintyMode: async () => {},
      signOut: async () => {},
      signIn: async () => ({ user: null, session: null }),
      signUp: async () => ({ user: null, session: null }),
      resendConfirmationEmail: async () => {},
    };
  }

  return context;
};

export default useAuth;
