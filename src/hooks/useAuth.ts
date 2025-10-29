import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

type UserProfile = {
  id: string;
  role: 'coach' | 'athlete' | 'developer';
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (user: User, signal?: AbortSignal) => {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id);

    if (signal) {
      query = query.abortSignal(signal);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.warn('⚠️ Erreur lors du chargement du profil:', error.message);
    }

    if (!data) {
      console.warn('⚠️ Profil non trouvé, utilisation des métadonnées');
      // Fallback sur les métadonnées si le profil n'existe pas encore
      return {
        id: user.id,
        role: user.id === '75a17559-b45b-4dd1-883b-ce8ccfe03f0f' ? 'developer' :
              user.user_metadata?.role || 'athlete',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || ''
      };
    }
    return data;
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    let mounted = true;

    const initAuth = async () => {
      console.log('🔐 [useAuth] Début initAuth...');
      try {
        console.log('🔐 [useAuth] Appel getSession...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 [useAuth] Session récupérée:', session?.user?.id ? 'User trouvé' : 'Pas de user');

        if (session?.user && mounted) {
          console.log('🔐 [useAuth] Mise à jour user state...');
          setUser(session.user);
          console.log('🔐 [useAuth] Chargement profil...');
          const userProfile = await fetchUserProfile(session.user, signal);
          console.log('🔐 [useAuth] Profil chargé:', userProfile);
          if (mounted) {
            setProfile(userProfile);
          }
        } else if (mounted) {
          console.log('🔐 [useAuth] Pas de session, reset user/profile');
          setUser(null);
          setProfile(null);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('➡️ [useAuth] Fetch annulé, normal.');
          return;
        }
        console.error('❌ [useAuth] Erreur:', error);
        if (mounted) {
          setError(error?.message || 'Erreur de connexion');
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          console.log('✅ [useAuth] Fin initAuth, setLoading(false)');
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && mounted) {
        setError(null);
        setUser(session.user);
        const userProfile = await fetchUserProfile(session.user);
        if (mounted) {
          setProfile(userProfile);
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT' && mounted) {
        setError(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user && mounted) {
        const userProfile = await fetchUserProfile(session.user);
        if (mounted) {
          setUser(session.user);
          setProfile(userProfile);
        }
      }
    });

    return () => {
      mounted = false;
      controller.abort();
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error('Email ou mot de passe incorrect');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: 'athlete' | 'coach' = 'athlete', firstName?: string, lastName?: string) => {
    const actualRole = role;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            role: actualRole,
            first_name: firstName || '',
            last_name: lastName || ''
          }
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      if (error) {
        throw error;
      }

      return { success: true, message: 'Email de confirmation renvoyé avec succès' };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors du renvoi de l\'email');
    }
  };

  const signOut = async () => {
    console.log('🚪 DÉCONNEXION FORCÉE - Début...');
    
    // 1. Nettoyer immédiatement l'état React
    const currentUserId = user?.id;
    console.log('🧹 Nettoyage état React pour user:', currentUserId);
    
    setUser(null);
    setProfile(null);
    setLoading(false);
    setError(null);
    
    // 2. Nettoyer localStorage
    if (currentUserId) {
      console.log('🧹 Nettoyage localStorage...');
      localStorage.removeItem(`profile_${currentUserId}`);
      localStorage.removeItem(`workouts_${currentUserId}`);
      localStorage.removeItem(`records_${currentUserId}`);
      localStorage.removeItem(`bodycomps_${currentUserId}`);
      localStorage.removeItem(`athlete_groups_${currentUserId}`);
    }
    
    // 3. Nettoyer toutes les clés d'auth Supabase
    console.log('🧹 Nettoyage auth Supabase...');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-ifmoecnlpwnxcthplqra-auth-token');
    sessionStorage.clear();
    
    // 4. Tentative de déconnexion Supabase (en arrière-plan)
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Erreur Supabase ignorée:', error);
    }
    
    console.log('✅ DÉCONNEXION FORCÉE - Terminée');
  };

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resendConfirmationEmail
  };
}

export default useAuth;