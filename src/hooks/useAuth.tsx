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
  const profileRef = useRef<Profile | null>(null);

  // Update ref whenever state changes to access the latest profile in closures
  useEffect(() => {
    profileRef.current = authState.profile;
  }, [authState.profile]);

  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    logger.info('[useAuth] Début du chargement du profil pour:', userId);
    logger.info('[useAuth] Colonnes demandées:', PROFILE_COLS);

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: La requête Supabase n\'a pas répondu dans les 15 secondes'));
        }, 15000);
      });

      const queryPromise = supabase
        .from('profiles')
        .select(PROFILE_COLS)
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

      // Mise en cache du profil
      try {
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
      } catch (e) {
        logger.warn('[useAuth] Impossible de mettre en cache le profil:', e);
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
        // If reload failed but we had a profile, we might want to keep it?
        // But refreshProfile is explicit action. If it fails, we probably should let the user know or keep old one.
        // Current behavior: update if we got something, or null if failed.
        // Let's make it safer: if profile is null (error), keep old one?
        // Standard behavior usually implies if refresh fails, you keep stale data.
        
        if (profile) {
           setAuthState(prev => createAuthState(prev.session, prev.user, profile, prev.isInitialized, true));
        } else {
           logger.warn('[useAuth] Refresh failed, keeping existing profile.');
        }
      }
    } catch (e) {
      logger.error('[useAuth] Erreur lors du rafraîchissement:', e);
    }
  }, [authState.user, loadProfile]);

  const updateSprintyMode = useCallback(async (newMode: 'simple' | 'expert') => {
    if (!authState.user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ sprinty_mode: newMode })
        .eq('id', authState.user.id);

      if (error) throw error;

      setAuthState(prev => {
        if (!prev.profile) return prev;
        return {
          ...prev,
          profile: { ...prev.profile, sprinty_mode: newMode },
        };
      });
    } catch (error) {
      logger.error('[useAuth] Erreur lors de la mise à jour du mode Sprinty:', error);
    }
  }, [authState.user]);

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

        if (error) logger.warn('[useAuth] Erreur lors de getSession:', error);
        if (!isMountedRef.current) return;

        const currentUser = session?.user ?? null;
        
        // STRATÉGIE : On initialise l'UI dès qu'on a la session
        setAuthState(createAuthState(session, currentUser, null, true, !!currentUser));

        if (currentUser) {
          // Essayer de charger le profil depuis le cache local immédiatement
          try {
            const cachedProfileStr = localStorage.getItem(PROFILE_CACHE_KEY);
            if (cachedProfileStr) {
              const cachedProfile = JSON.parse(cachedProfileStr) as Profile;
              if (cachedProfile.id === currentUser.id) {
                logger.info('[useAuth] ⚡ Profil chargé depuis le cache !');
                if (isMountedRef.current) {
                  setAuthState(createAuthState(session, currentUser, cachedProfile, true, true));
                }
              }
            }
          } catch (e) {
            logger.warn('[useAuth] Erreur lecture cache profil:', e);
          }
          
          logger.info('[useAuth] Chargement frais du profil en arrière-plan...');
          const currentProfile = await loadProfile(currentUser.id);
          
          if (isMountedRef.current) {
            setAuthState(createAuthState(session, currentUser, currentProfile, true, false));
          }

        } else {
          logger.info('[useAuth] Aucun utilisateur authentifié trouvé.');
          localStorage.removeItem(PROFILE_CACHE_KEY);
          if (isMountedRef.current) {
            setAuthState(createAuthState(null, null, null, true, false));
          }
        }
        logger.info('[useAuth] Initialisation terminée.');

      } catch (error) {
        logger.error('[useAuth] Erreur critique lors de l\'initialisation:', error);
        if (isMountedRef.current) {
          setAuthState(createAuthState(null, null, null, true, false));
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;
      logger.info('[useAuth] Événement auth:', event);

      const currentUser = session?.user ?? null;

      if (event === 'TOKEN_REFRESHED' && profileRef.current && currentUser && profileRef.current.id === currentUser.id) {
        logger.info('[useAuth] TOKEN_REFRESHED: On met juste à jour la session.');
        setAuthState(prev => ({ ...prev, session, user: currentUser }));
        return;
      }

      setAuthState(prev => ({ ...prev, session, user: currentUser, isProfileLoading: !!currentUser }));

      if (currentUser) {
        const loadedProfile = await loadProfile(currentUser.id);
        if (isMountedRef.current) {
          if (loadedProfile) {
            setAuthState(createAuthState(session, currentUser, loadedProfile, true, false));
          } else {
            logger.warn('[useAuth] Le profil n\'a pas pu être chargé après l\'événement, conservation de l\'ancien si possible.');
            setAuthState(prev => {
              if (prev.profile && prev.user?.id === currentUser.id) {
                return createAuthState(session, currentUser, prev.profile, true, false);
              }
              return createAuthState(session, currentUser, null, true, false);
            });
          }
        }
      } else {
        if (isMountedRef.current) {
          setAuthState(createAuthState(null, null, null, true, false));
        }
      }
      logger.info('[useAuth] État mis à jour après événement.');
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const loading = !authState.isInitialized;
  const profileLoading = authState.isProfileLoading;

  const contextValue = React.useMemo(
    () => ({
      session: authState.session,
      user: authState.user,
      profile: authState.profile,
      loading,
      profileLoading,
      refreshProfile,
      updateProfile,
      updateSprintyMode,
      signOut,
      signIn,
      signUp,
      resendConfirmationEmail,
    }),
    [authState, loading, profileLoading, refreshProfile, updateProfile, signOut, signIn, signUp, resendConfirmationEmail]
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
      profileLoading: true,
      refreshProfile: async () => {},
      updateProfile: () => {},
      updateSprintyMode: async () => {},
      signOut: async () => {},
      signIn: async () => ({ user: null, session: null }),
      signUp: async () => ({ user: null, session: null }),
      resendConfirmationEmail: async () => {}
    };
  }
  return context;
};

export default useAuth;