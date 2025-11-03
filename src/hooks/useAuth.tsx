// src/hooks/useAuth.tsx

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

  const fetchProfileInBackground = useCallback(async (user: User) => {
    console.log(`📡 [useAuth] Tentative de chargement du profil complet en arrière-plan...`);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*') // On essaie de tout charger pour avoir les détails
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        console.log("✅ [useAuth] Profil complet chargé et mis à jour.", data);
        setProfile(data); // Met à jour le profil avec les vraies données
      } else {
         console.log("🟡 [useAuth] Le profil complet n'a pas été trouvé en BDD.");
      }
    } catch (e: any) {
      console.error("❌ [useAuth] L'erreur de chargement en arrière-plan a été ignorée pour ne pas bloquer l'UI:", e.message);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log(`🔐 [useAuth] Événement reçu: ${_event}`);
        const currentUser = session?.user ?? null;
        
        setSession(session);
        setUser(currentUser);

        if (currentUser) {
          // Création d'un profil préliminaire pour un affichage immédiat
          const preliminaryProfile: Profile = {
            id: currentUser.id,
            email: currentUser.email,
            first_name: currentUser.user_metadata?.first_name || "Coach",
            last_name: currentUser.user_metadata?.last_name || "",
            role: 'coach', // On utilise votre rôle directement
            created_at: new Date().toISOString(),
          };
          setProfile(preliminaryProfile);
          console.log("✅ [useAuth] Profil préliminaire 'coach' créé. L'UI est débloquée.");

          // On lance le chargement du profil complet en arrière-plan
          fetchProfileInBackground(currentUser);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, [fetchProfileInBackground]);

  // Les autres fonctions restent identiques
  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfileInBackground(user);
  }, [user, fetchProfileInBackground]);
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error; return data;
  }, []);
  const signUp = useCallback(async (email: string, password: string, profileData: any) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: profileData.first_name, last_name: profileData.last_name } } });
    if (error) throw error; if (!data.user) throw new Error('Aucun utilisateur créé');
    const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, email, ...profileData });
    if (profileError) throw new Error(`Erreur: ${profileError.message}`); return data;
  }, []);
  const resendConfirmationEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  }, []);
  const signOut = useCallback(async () => { await supabase.auth.signOut(); setProfile(null); }, []);

  const contextValue = { session, user, profile, loading, refreshProfile, signOut, signIn, signUp, resendConfirmationEmail };

  return (<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default useAuth;