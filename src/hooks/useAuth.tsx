import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, profileData: any) => Promise<any>;
  resendConfirmationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user: User) => {
    console.log(`📡 [useAuth] Chargement du profil pour: ${user.id}`);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        console.log("✅ [useAuth] Profil chargé:", data);
        setProfile(data);
      } else {
         console.log("🟡 [useAuth] Aucun profil trouvé en BDD pour cet utilisateur.");
         setProfile(null);
      }
    } catch (e: any) {
      console.error("❌ [useAuth] Erreur lors de la récupération du profil:", e.message);
      setProfile(null); // En cas d'erreur, on ne laisse pas un profil potentiellement incorrect
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user);
  }, [user, fetchProfile]);
  
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error; 
    return data;
  }, []);

  const signUp = useCallback(async (email: string, password: string, profileData: any) => {
    // 1. Inscription de l'utilisateur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, password,
      options: { data: { first_name: profileData.first_name, last_name: profileData.last_name } }
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Inscription échouée, aucun utilisateur créé.');

    // 2. Création du profil associé
    // Important: l'utilisateur est maintenant authentifié, la politique RLS va fonctionner.
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id, // L'ID doit correspondre à l'utilisateur authentifié
      email,
      ...profileData
    });
    if (profileError) {
      // Si la création du profil échoue, il faut le signaler clairement.
      throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
    }
    
    return authData;
  }, []);
  
  const resendConfirmationEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => { 
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log(`🔐 [useAuth] Événement reçu: ${_event}`);
        const currentUser = session?.user ?? null;
        
        setSession(session);
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, [fetchProfile]);
  
  const contextValue = { session, user, profile, loading, refreshProfile, signOut, signIn, signUp, resendConfirmationEmail };

  return (<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default useAuth;