import { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types';

// CORRECTIF : Ajout de 'photo_url' à la liste des colonnes
const PROFILE_COLUMNS = 'id, full_name, first_name, last_name, role, photo_url';

const MINIMAL_PROFILE_COLUMNS = 'id, first_name, last_name, role';

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
    let timeoutId: NodeJS.Timeout;

    const loadProfileInline = async (userId: string) => {
      try {
        console.log('🔄 [useAuth] Chargement du profil pour:', userId);

        const { data, error } = await supabase
          .from('profiles')
          .select(PROFILE_COLUMNS)
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('❌ [useAuth] Erreur chargement profil:', error);
          throw error;
        }

        console.log('✅ [useAuth] Profil chargé:', data);
        if (isMountedRef.current) setProfile(data);
      } catch (e) {
        console.error("❌ [useAuth] Exception lors du chargement du profil:", e);
        if (isMountedRef.current) setProfile(null);
      }
    };

    // Vérification initiale de la session
    const initAuth = async () => {
      try {
        console.log('🚀 [useAuth] Initialisation de l\'authentification');
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMountedRef.current) return;

        console.log('📋 [useAuth] Session récupérée:', session ? 'Oui' : 'Non');
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          console.log('👤 [useAuth] Utilisateur connecté, chargement du profil...');
          await loadProfileInline(currentUser.id);
        } else {
          console.log('👤 [useAuth] Aucun utilisateur connecté');
          setProfile(null);
        }

        console.log('✅ [useAuth] Initialisation terminée');
        setLoading(false);
      } catch (error) {
        console.error("❌ [useAuth] Erreur lors de l'initialisation:", error);
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    // Timeout de sécurité: arrêter le loading après 15 secondes
    // IMPORTANT: Ne pas bloquer l'application, juste arrêter le spinner
    timeoutId = setTimeout(() => {
      if (isMountedRef.current && loading) {
        console.warn("⚠️ [useAuth] Timeout de chargement atteint après 15s");
        console.warn("⚠️ [useAuth] L'application continue sans profil complet");
        setLoading(false);
      }
    }, 15000);

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMountedRef.current) return;

      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await loadProfileInline(currentUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);
  
  const contextValue = { session, user, profile, loading, refreshProfile, updateProfile, signOut, signIn, signUp, resendConfirmationEmail };

  return (<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default useAuth;
