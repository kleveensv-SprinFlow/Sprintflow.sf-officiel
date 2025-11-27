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

// MOCK DATA FOR COACH
const MOCK_COACH_PROFILE: Profile = {
    id: 'coach-123',
    role: 'coach',
    first_name: 'Jean',
    last_name: 'Dupont',
    full_name: 'Jean Dupont',
    email: 'jean.dupont@coach.com',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    created_at: new Date().toISOString(),
    sexe: 'homme',
    date_de_naissance: '1985-05-15',
    license_number: null, // Should be ignored
    height: null,
    weight: null
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // MOCKED PROVIDER
  const contextValue = {
    session: { access_token: 'mock', user: { id: 'coach-123', email: 'coach@test.com' } } as any,
    user: { id: 'coach-123', email: 'coach@test.com' } as any,
    profile: MOCK_COACH_PROFILE,
    loading: false,
    profileLoading: false,
    refreshProfile: async () => {},
    updateProfile: () => {},
    updateSprintyMode: async () => {},
    signOut: async () => {},
    signIn: async () => ({ user: { id: 'coach-123' }, session: {} }),
    signUp: async () => {},
    resendConfirmationEmail: async () => {},
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default useAuth;