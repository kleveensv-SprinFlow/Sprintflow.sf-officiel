import React, { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types';
import { logger } from '../utils/logger';

const PROFILE_COLUMNS = 'id, full_name, first_name, last_name, role, photo_url';
const PROFILE_LOAD_TIMEOUT = 7000;

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

const createAuthState = (session: Session | null, user: User | null, profile: Profile | null, isInitialized: boolean): AuthState => ({
  session,
  user,
  profile,
  isInitialized,
  isProfileLoaded: user ? !!profile : true,
});

let authCycleId = 0;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(createEmptyAuthState());
  const isMountedRef = useRef(true);
  const currentCycleRef = useRef<number>(0);

  const ensureProfileExists = useCallback(async (userId: string, userEmail: string, userMetadata?: any): Promise<Profile | null> => {
    const cycleId = currentCycleRef.current;
    try {
      logger.info(`[useAuth:${cycleId}] 🔍 Vérification existence du profil pour:`, userId);

      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        logger.error(`[useAuth:${cycleId}] Erreur lors de la vérification du profil:`, fetchError);
        throw fetchError;
      }

      if (existingProfile) {
        logger.info(`[useAuth:${cycleId}] ✅ Profil existant trouvé:`, { id: existingProfile.id, role: existingProfile.role });
        return existingProfile;
      }

      logger.warn(`[useAuth:${cycleId}] 🆕 Aucun profil trouvé, création automatique d'un profil par défaut`);

      const defaultRole = userMetadata?.role || 'athlete';
      const defaultProfile = {
        id: userId,
        email: userEmail,
        role: defaultRole,
        full_name: userEmail.split('@')[0],
        first_name: '',
        last_name: '',
      };

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select(PROFILE_COLUMNS)
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          logger.warn(`[useAuth:${cycleId}] Profil existe déjà (conflit), re-tentative de lecture`);
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select(PROFILE_COLUMNS)
            .eq('id', userId)
            .maybeSingle();
          return retryProfile;
        }
        logger.error(`[useAuth:${cycleId}] ❌ Erreur lors de la création du profil:`, insertError);
        throw insertError;
      }

      logger.info(`[useAuth:${cycleId}] ✅ Profil par défaut créé avec succès:`, { id: newProfile.id, role: newProfile.role });
      return newProfile;
    } catch (e) {
      logger.error(`[useAuth:${cycleId}] ❌ Exception dans ensureProfileExists:`, e);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!authState.user) return;
    try {
      const profile = await ensureProfileExists(authState.user.id, authState.user.email!, authState.user.user_metadata);
      if (isMountedRef.current && profile) {
        setAuthState(prev => createAuthState(prev.session, prev.user, profile, prev.isInitialized));
      }
    } catch (e) {
      logger.error("❌ [useAuth] Erreur lors du rafraîchissement:", e);
    }
  }, [authState.user, ensureProfileExists]);

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
      const mappedRole = roleMap[profileData.role?.toLowerCase()] || 'athlete';
      const redirectUrl = window.location.hostname === 'localhost' ? `${window.location.origin}/` : 'https://sprintflow.one/';
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl, data: { ...profileData, role: mappedRole } } });
      if (error) throw error;
      if (!data.user) throw new Error('Aucun utilisateur créé');
      if (data.session) {
        const newProfile = { id: data.user.id, email: email, ...profileData, role: mappedRole };
        const { error: insertError } = await supabase.from('profiles').insert(newProfile);
        if (insertError && insertError.code !== '23505') throw insertError;
      }
      return data;
    } catch (error) {
      if (error instanceof Error && error.message?.includes('User already registered')) throw new Error('Cet email est déjà utilisé.');
      throw error;
    }
  }, []);
  
  const resendConfirmationEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    try {
      logger.info('[useAuth] 🚪 Déconnexion en cours...');
      setAuthState(createEmptyAuthState());
      await supabase.auth.signOut();
      Object.keys(localStorage).forEach(key => { if (key.startsWith('sb-')) localStorage.removeItem(key); });
      logger.info('[useAuth] ✅ Déconnexion réussie');
    } catch (error) {
      logger.error('❌ [useAuth] Erreur critique signOut:', error);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    currentCycleRef.current = ++authCycleId;
    const cycleId = currentCycleRef.current;

    const loadProfileWithTimeout = async (userId: string, userEmail: string, userMetadata?: any): Promise<Profile | null> => {
      logger.info(`[useAuth:${cycleId}] 📥 START_PROFILE_LOADING`);
      const timerId = logger.time(`[useAuth:${cycleId}] Temps chargement profil`);

      try {
        const profilePromise = ensureProfileExists(userId, userEmail, userMetadata);
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout profil après 7s')), PROFILE_LOAD_TIMEOUT)
        );

        const profile = await Promise.race([profilePromise, timeoutPromise]);

        logger.timeEnd(timerId);

        if (profile) {
          logger.info(`[useAuth:${cycleId}] ✅ PROFILE_LOADED:`, { id: profile.id, role: profile.role });
        } else {
          logger.warn(`[useAuth:${cycleId}] ⚠️ PROFILE_FAILED: Profil null`);
        }

        return profile;
      } catch (e: any) {
        logger.timeEnd(timerId);
        if (e.message?.includes('Timeout')) {
          logger.error(`[useAuth:${cycleId}] ⏱️ PROFILE_TIMEOUT: Délai dépassé, création profil par défaut`);
          return await ensureProfileExists(userId, userEmail, userMetadata);
        }
        logger.error(`[useAuth:${cycleId}] ❌ PROFILE_ERROR:`, e);
        return null;
      }
    };

    const initAuth = async () => {
      try {
        logger.info(`[useAuth:${cycleId}] 🚀 START_INIT`);

        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null }, error: null }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null }, error: null }), 5000)
        );

        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);

        if (error) {
          logger.warn(`[useAuth:${cycleId}] Erreur (ignorée) pendant getSession:`, error);
        }

        if (!isMountedRef.current) return;

        logger.info(`[useAuth:${cycleId}] 📦 SESSION_LOADED:`, session ? 'Session trouvée' : 'Pas de session');

        const currentUser = session?.user ?? null;
        let currentProfile: Profile | null = null;

        if (currentUser) {
          logger.info(`[useAuth:${cycleId}] 👤 Utilisateur détecté, chargement du profil...`);
          currentProfile = await loadProfileWithTimeout(currentUser.id, currentUser.email!, currentUser.user_metadata);
        } else {
          logger.info(`[useAuth:${cycleId}] 🚫 Aucun utilisateur connecté`);
        }

        if (!isMountedRef.current) return;

        const newState = createAuthState(session, currentUser, currentProfile, true);

        logger.info(`[useAuth:${cycleId}] ⚛️ ATOMIC_STATE_UPDATE:`, {
          hasSession: !!newState.session,
          hasUser: !!newState.user,
          hasProfile: !!newState.profile,
          isInitialized: newState.isInitialized,
          isProfileLoaded: newState.isProfileLoaded,
        });

        setAuthState(newState);

        logger.info(`[useAuth:${cycleId}] ✅ AUTH_READY: Initialisation terminée`);
      } catch (error) {
        logger.error(`[useAuth:${cycleId}] ❌ INIT_ERROR:`, error);
        if (isMountedRef.current) {
          setAuthState(createAuthState(null, null, null, true));
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      const eventCycleId = ++authCycleId;
      currentCycleRef.current = eventCycleId;

      logger.info(`[useAuth:${eventCycleId}] 🔔 AUTH_EVENT:`, event);

      const currentUser = session?.user ?? null;
      let currentProfile: Profile | null = null;

      if (currentUser) {
        logger.info(`[useAuth:${eventCycleId}] 👤 Utilisateur détecté après événement, chargement profil...`);
        currentProfile = await loadProfileWithTimeout(currentUser.id, currentUser.email!, currentUser.user_metadata);
      } else {
        logger.info(`[useAuth:${eventCycleId}] 🚫 Aucun utilisateur après événement`);
      }

      if (!isMountedRef.current) return;

      const newState = createAuthState(session, currentUser, currentProfile, true);

      logger.info(`[useAuth:${eventCycleId}] ⚛️ ATOMIC_STATE_UPDATE après événement:`, {
        event,
        hasSession: !!newState.session,
        hasUser: !!newState.user,
        hasProfile: !!newState.profile,
        isInitialized: newState.isInitialized,
        isProfileLoaded: newState.isProfileLoaded,
      });

      setAuthState(newState);

      logger.info(`[useAuth:${eventCycleId}] ✅ AUTH_STATE_SYNCED`);
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [ensureProfileExists]);
  
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
    logger.error('❌ [useAuth] Context is undefined! This should never happen.');
    logger.error('❌ [useAuth] Make sure AuthProvider is mounted in main.tsx');
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