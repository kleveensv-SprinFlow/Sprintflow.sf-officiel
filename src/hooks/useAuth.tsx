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
      // Utiliser l'URL de production pour la redirection email
      const redirectUrl = window.location.hostname === 'localhost'
        ? `${window.location.origin}/`
        : 'https://sprintflow.one/';

      console.log('🔗 [useAuth] URL de redirection:', redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
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

        // Charger toutes les colonnes du profil
        const queryPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        console.log('🚀 [useAuth] Requête Supabase lancée, en attente de réponse...');

        // Timeout de 3 secondes pour passer rapidement à l'Edge Function
        const timeoutPromise = new Promise((_, reject) => {
          const timeout = setTimeout(() => {
            console.error('⏰ [useAuth] TIMEOUT atteint - passage à Edge Function');
            reject(new Error('Timeout après 3 secondes'));
          }, 3000);
          return timeout;
        });

        const result = await Promise.race([queryPromise, timeoutPromise]);

        console.log('📦 [useAuth] Réponse reçue');

        if (!isMountedRef.current) return;

        const { data, error } = result as any;

        if (error) {
          console.error('❌ [useAuth] Erreur profil:', error);
          // Ne pas créer de profil minimal, laisser null pour que l'Edge Function soit appelée
          throw error;
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

        // En cas de timeout, essayer via Edge Function (contournement pour StackBlitz)
        console.log('🔄 [useAuth] Tentative via Edge Function...');

        try {
          // Récupérer le token directement du localStorage (bypass Supabase client)
          const storageKey = `sb-${import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`;
          const authDataStr = localStorage.getItem(storageKey);
          console.log('🔑 [useAuth] Storage key:', storageKey);
          console.log('🔑 [useAuth] Auth data exists:', !!authDataStr);

          let accessToken: string | null = null;

          if (authDataStr) {
            try {
              const authData = JSON.parse(authDataStr);
              accessToken = authData?.access_token || authData?.currentSession?.access_token;
              console.log('🔑 [useAuth] Token trouvé:', !!accessToken);
            } catch (parseErr) {
              console.error('❌ [useAuth] Erreur parse localStorage:', parseErr);
            }
          }

          if (accessToken) {
            console.log('📡 [useAuth] Appel Edge Function avec token...');
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-profile`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                },
              }
            );

            console.log('📡 [useAuth] Response status:', response.status);

            if (response.ok) {
              const profileData = await response.json();
              console.log('✅ [useAuth] Profil récupéré via Edge Function!', profileData);
              setProfile(profileData);
              return;
            } else {
              const errorText = await response.text();
              console.error('❌ [useAuth] Edge Function error:', response.status, errorText);
            }
          } else {
            console.error('❌ [useAuth] Pas de token trouvé dans localStorage');
          }
        } catch (edgeFuncErr) {
          console.error('❌ [useAuth] Edge Function échouée aussi:', edgeFuncErr);
        }

        // En dernier recours, laisser le profil null pour forcer un rechargement
        if (isMountedRef.current) {
          console.warn('⚠️ [useAuth] Toutes les tentatives ont échoué - profil null');
          setProfile(null);
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