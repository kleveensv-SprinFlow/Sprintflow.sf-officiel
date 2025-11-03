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

  const fetchProfile = useCallback(async (user: User) => {
    console.log(`📡 [useAuth] Chargement du profil pour: ${user.id}`);
    try {
      // Requête simplifiée pour être plus robuste
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // 'PGRST116' signifie "aucune ligne trouvée", ce n'est pas une erreur critique ici.
        throw error;
      }

      if (data) {
        console.log("✅ [useAuth] Profil chargé depuis la base de données:", data);
        setProfile(data);
      } else {
        // Fallback: si le profil n'existe pas, créer un profil de base en mémoire
        console.log("🟡 [useAuth] Aucun profil trouvé en BDD. Utilisation d'un profil de secours.");
        const fallbackProfile: Profile = {
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || "Utilisateur",
          last_name: user.user_metadata?.last_name || "",
          // Tenter de deviner le rôle, sinon 'athlete' par défaut
          role: user.user_metadata?.role || 'athlete', 
          created_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
      }
    } catch (e: any) {
      console.error("❌ [useAuth] Erreur critique lors du chargement du profil:", e.message);
      // En cas d'erreur, on empêche le blocage en créant un profil de secours
      const errorProfile: Profile = {
        id: user.id,
        email: user.email,
        first_name: "Erreur",
        last_name: "Profil",
        role: 'athlete',
        created_at: new Date().toISOString(),
      };
      setProfile(errorProfile);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    console.log('🔄 [useAuth] Rafraîchissement manuel du profil...');
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);
  
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async (email: string, password: string, profileData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { first_name: profileData.first_name, last_name: profileData.last_name } }
    });
    if (error) throw error;
    if (!data.user) throw new Error('Aucun utilisateur créé');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, email, ...profileData });
    if (profileError) throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
    return data;
  }, []);
  
  const resendConfirmationEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log(`🔐 [useAuth] Événement reçu: ${_event}`);
        setLoading(true);
        try {
          setSession(session);
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser);
          } else {
            setProfile(null);
          }
        } catch (error) {
            console.error("❌ [useAuth] Erreur critique dans onAuthStateChange:", error);
        } finally {
            setLoading(false);
            console.log("✅ [useAuth] Fin de traitement, chargement terminé.");
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  useEffect(() => {
    const handleProfileUpdate = () => refreshProfile();
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [refreshProfile]);

  const contextValue = { session, user, profile, loading, refreshProfile, signOut, signIn, signUp, resendConfirmationEmail };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;