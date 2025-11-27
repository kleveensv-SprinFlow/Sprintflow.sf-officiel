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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const mounted = useRef(true);

  // Helper to load profile from cache
  const loadProfileFromCache = useCallback(() => {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProfile(parsed);
        return parsed;
      } catch (e) {
        localStorage.removeItem(PROFILE_CACHE_KEY);
      }
    }
    return null;
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!mounted.current) return;
    setProfileLoading(true);
    try {
      // Timeout de sécurité pour le chargement du profil (10s)
      let timeoutId: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
      });

      const fetchPromise = supabase
        .from('profiles')
        .select(PROFILE_COLS)
        .eq('id', userId)
        .maybeSingle();

      try {
        // Race between fetch and timeout
        const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
        clearTimeout(timeoutId!);
        
        const { data, error } = result;

        if (error) throw error;

        if (data && mounted.current) {
          setProfile(data as Profile);
          localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
        } else if (!data && mounted.current) {
          // Fallback: if no profile found, keep cache if valid or null
          console.warn('Profile not found for user', userId);
        }
      } catch (error: any) {
        clearTimeout(timeoutId!);
        throw error;
      }
        setProfile(data as Profile);
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
      } else if (!data && mounted.current) {
        // Fallback: if no profile found, keep cache if valid or null
        console.warn('Profile not found for user', userId);
      }
    } catch (error: any) {
      logger.error('Error fetching profile:', error);
      // On error, maybe fallback to cache?
    } finally {
      if (mounted.current) setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const updateProfile = useCallback((updatedProfileData: Partial<Profile>) => {
    setProfile(prev => {
      const newVal = prev ? { ...prev, ...updatedProfileData } : null;
      if (newVal) {
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(newVal));
      }
      return newVal;
    });
  }, []);

  const updateSprintyMode = async (newMode: 'simple' | 'expert') => {
      if (!user || !profile) return;
      
      // Optimistic update
      updateProfile({ sprinty_mode: newMode } as any);
      
      const { error } = await supabase
          .from('profiles')
          .update({ sprinty_mode: newMode })
          .eq('id', user.id);
          
      if (error) {
          logger.error("Error updating sprinty mode", error);
          refreshProfile(); // Revert on error
      }
  };

  useEffect(() => {
    mounted.current = true;
    
    // Initial load
    const initAuth = async () => {
      // Timeout global de sécurité pour l'initialisation (7s)
      // Cela évite de rester bloqué sur l'écran "Chronométrage en cours..."
      let timeoutId: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Auth initialization timeout')), 7000);
      });

      const authLogic = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted.current) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
             // Try cache first for speed
             const cached = loadProfileFromCache();
             // Then fetch fresh
             await fetchProfile(session.user.id);
          } else {
             setProfile(null);
             localStorage.removeItem(PROFILE_CACHE_KEY);
          }
        }
      };

      try {
        await Promise.race([authLogic(), timeoutPromise]);
        clearTimeout(timeoutId!);
      } catch (error) {
        clearTimeout(timeoutId!);
        logger.error('Error initializing auth:', error);
      } finally {
        if (mounted.current) {
          setLoading(false);
          // Force l'arrêt du chargement profil pour débloquer l'UI en cas de timeout
          setProfileLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted.current) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
         await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        localStorage.removeItem(PROFILE_CACHE_KEY);
        setLoading(false);
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, loadProfileFromCache]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, profileData: Partial<Profile>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...profileData,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem(PROFILE_CACHE_KEY);
  };

  const resendConfirmationEmail = async (email: string) => {
      const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email
      });
      if (error) throw error;
  };

  const value = {
    session,
    user,
    profile,
    loading,
    profileLoading,
    refreshProfile,
    updateProfile,
    updateSprintyMode,
    signIn,
    signUp,
    signOut,
    resendConfirmationEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default useAuth;