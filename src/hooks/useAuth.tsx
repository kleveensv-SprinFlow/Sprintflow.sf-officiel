import React, { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types';
import { logger } from '../utils/logger';

const PROFILE_COLS = 'id,full_name,first_name,last_name,email,role,photo_url,sprinty_mode,discipline,sexe,date_de_naissance,license_number,role_specifique,onboarding_completed,preferred_language';
const PROFILE_CACHE_KEY = 'sprintflow_profile_cache';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isInitialized: boolean;
  isProfileLoading: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
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
  isProfileLoading: false,
});

const createAuthState = (session: Session | null, user: User | null, profile: Profile | null, isInitialized: boolean, isProfileLoading: boolean = false): AuthState => ({
  session,
  user,
  profile,
  isInitialized,
  isProfileLoading,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(createEmptyAuthState());
  const isMountedRef = useRef(true);
  
  // Ref pour garder une trace du profil actuel sans dépendre du cycle de rendu dans les callbacks
  const profileRef = useRef<Profile | null>(null);

  useEffect(() => {
    profileRef.current = authState.profile;
  }, [authState.profile]);

  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!userId) return null;

    try {
      // On réduit le timeout à 10s pour être plus réactif en cas d'erreur réseau
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: La requête Supabase n\'a pas répondu dans les 20 secondes'));
        }, 20000);
      });

      const queryPromise = supabase
        .from('profiles')
        .select(PROFILE_COLS)
        .eq('id', userId)
        .maybeSingle();

      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]) as { data: Profile | null, error: any };

      if (error) {
        logger.error('[useAuth] Erreur chargement profil:', error.message);
        return null;
      }

      if (profile) {
        // Mise à jour du cache local storage
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
      }

      return profile;
    } catch (error) {
      logger.error('[useAuth] Exception loadProfile:', error);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!authState.user) return;
    try {
      const profile = await loadProfile(authState.user.id);
      if (isMountedRef.current && profile) {
           setAuthState(prev => createAuthState(prev.session, prev.user, profile, prev.isInitialized, false));
      }
    } catch (e) {
      logger.error('[useAuth] Erreur refresh:', e);
    }
  }, [authState.user, loadProfile]);

  const updateSprintyMode = useCallback(async (newMode: 'simple' | 'expert') => {
    if (!authState.user) return;
    try {
      const { error } = await supabase.from('profiles').update({ sprinty_mode: newMode }).eq('id', authState.user.id);
      if (error) throw error;

      setAuthState(prev => {
        if (!prev.profile) return prev;
        const newProfile = { ...prev.profile, sprinty_mode: newMode };
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(newProfile));
        return { ...prev, profile: newProfile };
      });
    } catch (error) {
      logger.error('[useAuth] Erreur updateSprintyMode:', error);
    }
  }, [authState.user]);

  const updateProfile = useCallback((updatedProfileData: Partial<Profile>) => {
    setAuthState(prev => {
      if (!prev.profile) return prev;
      const newProfile = { ...prev.profile, ...updatedProfileData };
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(newProfile));
      return { ...prev, profile: newProfile };
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
      // 1. Mise à jour immédiate de l'état pour l'UI (Optimistic UI update)
      // IMPORTANT : on met isInitialized à TRUE pour ne pas bloquer sur un loading screen
      setAuthState({
        session: null,
        user: null,
        profile: null,
        isInitialized: true, 
        isProfileLoading: false,
      });

      // 2. Nettoyage du cache
      localStorage.removeItem(PROFILE_CACHE_KEY);
      
      // Nettoyage agressif des tokens Supabase pour éviter les résidus
      Object.keys(localStorage).forEach(key => { 
        if (key.startsWith('sb-')) localStorage.removeItem(key); 
      });

      // 3. Appel Supabase
      await supabase.auth.signOut();
      
    } catch (error) {
      logger.error('[useAuth] Erreur signOut:', error);
      // En cas d'erreur, on force quand même la déconnexion visuelle
      setAuthState({
        session: null,
        user: null,
        profile: null,
        isInitialized: true,
        isProfileLoading: false,
      });
    }
  }, []);

  // --- EFFET PRINCIPAL D'INITIALISATION ---
  useEffect(() => {
    isMountedRef.current = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error && error.message !== 'Auth session missing!') logger.warn('[useAuth] Init warning:', error.message);
        
        if (!isMountedRef.current) return;

        const currentUser = session?.user ?? null;

        if (currentUser) {
          // CACHE CHECK
          let cachedProfile: Profile | null = null;
          try {
            const cachedStr = localStorage.getItem(PROFILE_CACHE_KEY);
            if (cachedStr) {
              const parsed = JSON.parse(cachedStr);
              if (parsed && parsed.id === currentUser.id) {
                cachedProfile = parsed;
              }
            }
          } catch (e) { /* ignore */ }

          if (cachedProfile) {
            setAuthState(createAuthState(session, currentUser, cachedProfile, true, false));
            // Background refresh
            loadProfile(currentUser.id).then(freshProfile => {
               if (isMountedRef.current && freshProfile) {
                 setAuthState(prev => createAuthState(session, currentUser, freshProfile, true, false));
               }
            });

          } else {
            // Pas de cache, on met loading true
            setAuthState(createAuthState(session, currentUser, null, true, true));
            const freshProfile = await loadProfile(currentUser.id);
            if (isMountedRef.current) {
               setAuthState(createAuthState(session, currentUser, freshProfile, true, false));
            }
          }

        } else {
          // Pas d'utilisateur connecté
          setAuthState(createAuthState(null, null, null, true, false));
        }

      } catch (error) {
        logger.error('[useAuth] Crash init:', error);
        setAuthState(createAuthState(null, null, null, true, false));
      }
    };

    initAuth();

    // --- LISTENER SUPABASE ---
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;
      
      const currentUser = session?.user ?? null;
      
      setAuthState(prev => {
        // Si c'est un SIGN_OUT explicite ou session null, on s'assure que tout est clean
        if (event === 'SIGNED_OUT' || !currentUser) {
           return {
             session: null,
             user: null,
             profile: null,
             isInitialized: true, // CRITIQUE: Toujours true ici
             isProfileLoading: false
           };
        }

        // BLINDAGE ANTI-FLASH :
        // Si l'utilisateur est le même qu'avant (ID identique)
        // ET qu'on a déjà un profil chargé...
        if (currentUser?.id === prev.user?.id && prev.profile) {
            return { 
                ...prev, 
                session, 
                user: currentUser,
                isProfileLoading: false,
                isInitialized: true // On confirme l'initialisation
            };
        }

        // Cas normal (changement d'user, connexion initiale...)
        const alreadyHasData = prev.profile && prev.user?.id === currentUser?.id;
        const shouldShowLoading = !!currentUser && !alreadyHasData;

        return { 
          ...prev, 
          session, 
          user: currentUser, 
          isProfileLoading: shouldShowLoading,
          isInitialized: true // On est initialisé car on a reçu l'event
        };
      });

      // Rafraîchissement silencieux des données en arrière-plan si connecté
      if (currentUser && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const loadedProfile = await loadProfile(currentUser.id);
        if (isMountedRef.current && loadedProfile) {
           setAuthState(prev => ({
             ...prev,
             profile: loadedProfile,
             isProfileLoading: false
           }));
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const contextValue = React.useMemo(() => ({
    session: authState.session,
    user: authState.user,
    profile: authState.profile,
    loading: !authState.isInitialized, // Si isInitialized est false, loading est true
    profileLoading: authState.isProfileLoading,
    refreshProfile,
    updateProfile,
    updateSprintyMode,
    signOut,
    signIn,
    signUp,
    resendConfirmationEmail,
  }), [authState, refreshProfile, updateProfile, signOut, signIn, signUp, resendConfirmationEmail]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default useAuth;
