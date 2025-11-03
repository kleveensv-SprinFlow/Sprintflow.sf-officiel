import { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';
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
  const isMountedRef = useRef(true);

  const fetchProfile = useCallback(async (user: User) => {
    console.log(`📡 [useAuth] Chargement du profil pour: ${user.id}`);

    try {
      // Ajouter un timeout de 10 secondes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Le chargement du profil a pris trop de temps')), 10000);
      });

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('🔍 [useAuth] Exécution de la requête Supabase...');

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.log('📦 [useAuth] Réponse reçue de Supabase');

      if (error) {
        console.error('❌ [useAuth] Erreur lors du chargement du profil:', error);
        setProfile(null);
        return;
      }

      if (data) {
        console.log("✅ [useAuth] Profil chargé:", data);
        setProfile(data);
      } else {
        console.log("🟡 [useAuth] Aucun profil trouvé. Attente de la création du profil...");
        setProfile(null);
      }
    } catch (e: any) {
      console.error("❌ [useAuth] Erreur lors du chargement du profil:", e);
      setProfile(null);
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
    console.log('🔐 [useAuth] Tentative d\'inscription...');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: profileData.first_name,
          last_name: profileData.last_name
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Aucun utilisateur créé');

    console.log('✅ [useAuth] Utilisateur créé, le trigger va créer le profil...');

    // Le trigger handle_new_user() crée automatiquement le profil de base
    // On attend un peu puis on met à jour les champs supplémentaires
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        full_name: `${profileData.first_name} ${profileData.last_name}`,
        role: profileData.role || 'athlete',
        role_specifique: profileData.role_specifique,
        date_de_naissance: profileData.date_de_naissance,
        discipline: profileData.discipline,
        sexe: profileData.sexe,
        height: profileData.height,
      })
      .eq('id', data.user.id);

    if (updateError) {
      console.error('⚠️ [useAuth] Erreur mise à jour profil (non bloquante):', updateError);
    } else {
      console.log('✅ [useAuth] Profil mis à jour avec succès');
    }

    return data;
  }, []);
  
  const resendConfirmationEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log('🔐 [useAuth] Début de la déconnexion...');

      // Nettoyer complètement l'état local d'abord
      setProfile(null);
      setUser(null);
      setSession(null);

      // Déconnexion de Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ [useAuth] Erreur lors de la déconnexion:', error);
        throw error;
      }

      // Nettoyer le localStorage de Supabase manuellement
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });

      console.log('✅ [useAuth] Déconnexion réussie');
    } catch (error) {
      console.error('❌ [useAuth] Erreur critique lors de la déconnexion:', error);
      // Forcer le nettoyage même en cas d'erreur
      setProfile(null);
      setUser(null);
      setSession(null);
    }
  }, []);

  useEffect(() => {
    console.log("🔄 [useAuth] Initialisation du listener...");
    isMountedRef.current = true;

    const loadProfile = async (userId: string) => {
      console.log(`📡 [useAuth] Chargement profil inline pour: ${userId}`);

      try {
        // Timeout de 5 secondes
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout après 5 secondes')), 5000)
        );

        const queryPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        console.log('⏳ [useAuth] Requête Supabase lancée...');

        const result = await Promise.race([queryPromise, timeoutPromise]);

        console.log('📦 [useAuth] Réponse reçue');

        if (!isMountedRef.current) return;

        const { data, error } = result as any;

        if (error) {
          console.error('❌ [useAuth] Erreur profil:', error);
          // En cas d'erreur, créer un profil minimal pour débloquer
          setProfile({
            id: userId,
            role: 'athlete',
            email: '',
            first_name: 'Utilisateur',
            last_name: '',
          } as any);
          return;
        }

        if (data) {
          console.log("✅ [useAuth] Profil chargé:", data);
          setProfile(data);
        } else {
          console.log("🟡 [useAuth] Aucun profil trouvé");
          setProfile(null);
        }
      } catch (e: any) {
        console.error("❌ [useAuth] Exception:", e.message || e);
        // En cas de timeout, créer un profil minimal
        if (isMountedRef.current) {
          console.warn('⚠️ [useAuth] Timeout - Création profil minimal');
          setProfile({
            id: userId,
            role: 'athlete',
            email: '',
            first_name: 'Chargement',
            last_name: '...',
          } as any);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log(`🔐 [useAuth] Événement: ${_event}`);
        if (!isMountedRef.current) return;

        setLoading(true);

        try {
          setSession(session);
          const currentUser = session?.user ?? null;
          setUser(currentUser);

          if (currentUser) {
            console.log('👤 [useAuth] Chargement profil...');
            await loadProfile(currentUser.id);
          } else {
            console.log('🚫 [useAuth] Pas d\'utilisateur');
            setProfile(null);
          }
        } catch (error) {
          console.error("❌ [useAuth] Erreur:", error);
          if (isMountedRef.current) setProfile(null);
        } finally {
          if (isMountedRef.current) {
            console.log('🏁 [useAuth] Fin de chargement');
            setLoading(false);
          }
        }
      }
    );

    return () => {
      console.log("🛑 [useAuth] Nettoyage");
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);
  
  const contextValue = { session, user, profile, loading, refreshProfile, signOut, signIn, signUp, resendConfirmationEmail };

  return (<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default useAuth;