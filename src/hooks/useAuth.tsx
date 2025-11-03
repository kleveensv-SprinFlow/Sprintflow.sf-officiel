import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData: any) => Promise<void>;
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

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        console.log("✅ [useAuth] Profil chargé:", data);
        setProfile(data);
      } else {
        console.log("🟡 [useAuth] Aucun profil trouvé, l'utilisateur doit le créer.");
        setProfile(null);
      }
    } catch (e) {
      console.error("❌ [useAuth] Erreur lors du chargement du profil:", e);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    console.log('🔄 [useAuth] Rafraîchissement manuel du profil...');
    if (user) {
      await fetchProfile(user);
      console.log('✅ [useAuth] Profil rafraîchi avec succès');
    }
  }, [user, fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔐 [useAuth] Tentative de connexion...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ [useAuth] Erreur de connexion:', error);
      throw error;
    }

    console.log('✅ [useAuth] Connexion réussie');
    return data;
  }, []);

  const signUp = useCallback(async (email: string, password: string, profileData: any) => {
    console.log('📝 [useAuth] Tentative d\'inscription...');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
        }
      }
    });

    if (error) {
      console.error('❌ [useAuth] Erreur d\'inscription:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Aucun utilisateur créé');
    }

    console.log('✅ [useAuth] Inscription réussie, création du profil...');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        role: profileData.role,
        role_specifique: profileData.role_specifique || null,
        date_de_naissance: profileData.date_de_naissance || null,
        discipline: profileData.discipline || null,
        sexe: profileData.sexe || null,
        height: profileData.height || null,
      });

    if (profileError) {
      console.error('❌ [useAuth] Erreur création profil:', profileError);
      throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
    }

    console.log('✅ [useAuth] Profil créé avec succès');
    return data;
  }, []);

  const resendConfirmationEmail = useCallback(async (email: string) => {
    console.log('📧 [useAuth] Renvoi de l\'email de confirmation...');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      console.error('❌ [useAuth] Erreur renvoi email:', error);
      throw error;
    }

    console.log('✅ [useAuth] Email de confirmation renvoyé');
  }, []);

  useEffect(() => {
    console.log("🔄 [useAuth] Initialisation du listener...");
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

    return () => {
      console.log("🛑 [useAuth] Nettoyage du listener.");
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('🔄 [useAuth] Événement profile-updated reçu');
      refreshProfile();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [refreshProfile]);

  const contextValue = {
    session,
    user,
    profile,
    loading,
    refreshProfile,
    signIn,
    signUp,
    resendConfirmationEmail,
  };

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