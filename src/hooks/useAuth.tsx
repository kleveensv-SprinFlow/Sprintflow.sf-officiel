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