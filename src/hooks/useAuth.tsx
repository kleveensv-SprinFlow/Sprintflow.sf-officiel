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
    console.log('🔐 [useAuth] Tentative d\'inscription...', { email, profileData });

    try {
      // Mapper les rôles français vers anglais
      const roleMap: Record<string, string> = {
        'athlète': 'athlete',
        'athlete': 'athlete',
        'encadrant': 'coach',
        'coach': 'coach'
      };

      const mappedRole = roleMap[profileData.role?.toLowerCase()] || 'athlete';
      console.log('📋 [useAuth] Rôle mappé:', profileData.role, '->', mappedRole);

      // 1. Inscription de l'utilisateur avec TOUTES les données dans raw_user_meta_data
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            role: mappedRole,
            role_specifique: profileData.role_specifique || null,
            date_de_naissance: profileData.date_de_naissance || null,
            discipline: profileData.discipline || '',
            sexe: profileData.sexe || null,
            height: profileData.height || null
          }
        }
      });

      if (error) {
        console.error('❌ [useAuth] Erreur inscription:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('Aucun utilisateur créé');
      }

      console.log('✅ [useAuth] Utilisateur créé:', data.user.id);
      console.log('📧 [useAuth] Session:', data.session ? 'Existe (email confirmé ou désactivé)' : 'Null (email nécessite confirmation)');

      // 2. Créer le profil uniquement si l'utilisateur a une session immédiate
      // (confirmation d'email désactivée)
      // Si la confirmation est activée, le trigger handle_email_confirmation créera le profil
      if (data.session) {
        console.log('📝 [useAuth] Création du profil (session immédiate)...');

        const newProfile = {
          id: data.user.id,
          email: email,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          role: mappedRole,
          role_specifique: profileData.role_specifique || null,
          date_de_naissance: profileData.date_de_naissance || null,
          discipline: profileData.discipline || '',
          sexe: profileData.sexe || null,
          height: profileData.height || null,
        };

        console.log('📋 [useAuth] Données du profil:', newProfile);

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (insertError) {
          console.error('❌ [useAuth] Erreur création profil:', insertError);

          // Si le profil existe déjà (duplicate key), essayer de le mettre à jour
          if (insertError.code === '23505') {
            console.log('⚠️ [useAuth] Le profil existe déjà, tentative de mise à jour...');

            const { error: updateError } = await supabase
              .from('profiles')
              .update(newProfile)
              .eq('id', data.user.id);

            if (updateError) {
              console.error('❌ [useAuth] Erreur mise à jour profil:', updateError);
              throw new Error(`Impossible de créer ou mettre à jour le profil: ${updateError.message}`);
            }

            console.log('✅ [useAuth] Profil mis à jour avec succès');
          } else {
            throw new Error(`Erreur lors de la création du profil: ${insertError.message}`);
          }
        } else {
          console.log('✅ [useAuth] Profil créé avec succès');
        }
      } else {
        console.log('ℹ️ [useAuth] Pas de session immédiate - le profil sera créé après confirmation d\'email');
      }

      return data;
    } catch (error: any) {
      console.error('❌ [useAuth] Erreur complète inscription:', error);

      // Messages d'erreur plus clairs pour l'utilisateur
      if (error.message?.includes('User already registered')) {
        throw new Error('Cet email est déjà utilisé. Essayez de vous connecter.');
      }

      throw error;
    }
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
        console.log('⏳ [useAuth] Construction de la requête...');

        // Test avec uniquement les colonnes de base
        const queryPromise = supabase
          .from('profiles')
          .select('id, role, first_name, last_name, email')
          .eq('id', userId)
          .maybeSingle();

        console.log('🚀 [useAuth] Requête Supabase lancée, en attente de réponse...');

        // Augmenter le timeout à 15 secondes et ajouter des logs
        const timeoutPromise = new Promise((_, reject) => {
          const timeout = setTimeout(() => {
            console.error('⏰ [useAuth] TIMEOUT atteint - la requête ne répond pas');
            reject(new Error('Timeout après 15 secondes'));
          }, 15000);
          return timeout;
        });

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

        // En cas de timeout, essayer de récupérer le profil directement sans retry
        console.log('🔄 [useAuth] Tentative directe sans Promise.race...');

        try {
          const { data: directData, error: directError } = await supabase
            .from('profiles')
            .select('id, role, first_name, last_name, email')
            .eq('id', userId)
            .maybeSingle();

          if (directData && !directError) {
            console.log('✅ [useAuth] Profil récupéré en tentative directe!');
            setProfile(directData);
            return;
          }
        } catch (directErr) {
          console.error('❌ [useAuth] Tentative directe échouée aussi');
        }

        // En dernier recours, créer un profil minimal
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
            // Charger le profil une seule fois, sans retry
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