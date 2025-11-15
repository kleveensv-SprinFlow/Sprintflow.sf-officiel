import React, { useState, useEffect, useContext, createContext, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types';
import { logger } from '../utils/logger';

const PROFILE_COLUMNS = 'id, full_name, first_name, last_name, role, photo_url';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updatedProfileData: Partial<Profile>) => void;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<any>;
  resendConfirmationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', user.id).maybeSingle();
      if (error) throw error;
      if (isMountedRef.current) setProfile(data);
    } catch (e) {
      console.error("❌ [useAuth] Erreur lors du rafraîchissement:", e);
      if (isMountedRef.current) setProfile(null);
    }
  }, [user]);

  const updateProfile = useCallback((updatedProfileData: Partial<Profile>) => {
    setProfile(prevProfile => prevProfile ? { ...prevProfile, ...updatedProfileData } : null);
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
      setProfile(null);
      setUser(null);
      setSession(null);
      await supabase.auth.signOut();
      Object.keys(localStorage).forEach(key => { if (key.startsWith('sb-')) localStorage.removeItem(key); });
    } catch (error) {
      console.error('❌ [useAuth] Erreur critique signOut:', error);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const loadProfileInline = async (userId: string) => {
      let timerId: string = '';
      try {
        logger.info('[useAuth] Chargement du profil pour:', userId);
        timerId = logger.time('[useAuth] Temps de chargement profil');

        const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).maybeSingle();

        logger.timeEnd(timerId);

        if (error) {
          logger.error('[useAuth] Erreur Supabase:', error);
          logger.error('[useAuth] Code erreur:', error.code, 'Message:', error.message);
          throw error;
        }
        if (!data) {
          logger.warn('[useAuth] Aucun profil trouvé pour l\'utilisateur:', userId);
          if (isMountedRef.current) setProfile(null);
          return;
        }
        logger.info('[useAuth] Profil chargé avec succès:', { id: data.id, role: data.role });
        if (isMountedRef.current) setProfile(data);
      } catch (e) {
        if (timerId) logger.timeEnd(timerId);
        logger.error('[useAuth] Exception lors du chargement du profil:', e);
        if (isMountedRef.current) setProfile(null);
      }
    };

    const initAuth = async () => {
      try {
        logger.info('[useAuth] Initialisation de l\'authentification');

        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null }, error: null }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null }, error: null }), 5000)
        );

        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);

        if (error) {
          logger.warn('Erreur (ignorée) pendant getSession:', error);
        }

        if (!isMountedRef.current) return;

        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          logger.info('[useAuth] Utilisateur connecté, chargement du profil...');
          await loadProfileInline(currentUser.id);
        } else {
          logger.info('[useAuth] Aucun utilisateur connecté');
          setProfile(null);
        }
      } catch (error) {
        logger.error('[useAuth] Erreur lors de l\'initialisation:', error);
        if (isMountedRef.current) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMountedRef.current) {
          logger.info('[useAuth] Initialisation terminée, fin du chargement.');
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      logger.info('[useAuth] Auth state change:', event);

      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await loadProfileInline(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);
  
  const contextValue = React.useMemo(
    () => ({ session, user, profile, loading, refreshProfile, updateProfile, signOut, signIn, signUp, resendConfirmationEmail }),
    [session, user, profile, loading, refreshProfile, updateProfile, signOut, signIn, signUp, resendConfirmationEmail]
  );

  return (<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('❌ [useAuth] Context is undefined! This should never happen.');
    console.error('❌ [useAuth] Make sure AuthProvider is mounted in main.tsx');
    return {
      session: null,
      user: null,
      profile: null,
      loading: true,
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