import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  role: 'athlete' | 'coach';
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  height?: number;
  weight?: number;
  body_fat_percentage?: number;
  training_frequency?: string;
  dietary_preferences?: string[];
  personal_records?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      console.log('📡 [useProfile] Chargement du profil pour:', user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ [useProfile] Erreur Supabase:', error);
        throw error;
      }

      if (data) {
        console.log('✅ [useProfile] Profil chargé:', data);
        setProfile(data);
      } else {
        console.log('⚠️ [useProfile] Aucun profil trouvé pour cet utilisateur');
        setProfile(null);
      }
    } catch (error: any) {
      console.error('❌ [useProfile] Erreur lors du chargement:', error.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    const newProfile = {
      id: user.id,
      role: (user.user_metadata?.role as 'coach' | 'athlete') || 'athlete',
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
    };

    try {
      console.log('📝 [useProfile] Création du profil:', newProfile);

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ [useProfile] Erreur création:', error);
        throw error;
      }

      if (data) {
        console.log('✅ [useProfile] Profil créé:', data);
        setProfile(data);
        return data;
      }
    } catch (error: any) {
      console.error('❌ [useProfile] Erreur lors de la création:', error.message);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) {
      console.error('❌ [useProfile] Pas de profil à mettre à jour');
      return;
    }

    try {
      console.log('📝 [useProfile] Mise à jour du profil avec:', updates);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ [useProfile] Erreur mise à jour:', error);
        throw error;
      }

      if (data) {
        console.log('✅ [useProfile] Profil mis à jour:', data);
        setProfile(data);

        // Déclencher un événement global pour synchroniser les autres composants
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: data }));

        return data;
      }
    } catch (error: any) {
      console.error('❌ [useProfile] Erreur lors de la mise à jour:', error.message);
      throw error;
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    if (!profile) throw new Error('Profil non chargé');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/avatar.${fileExt}`;

      console.log('📤 [useProfile] Upload de la photo vers:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(`avatars/${fileName}`, file, { upsert: true });

      if (uploadError) {
        console.error('❌ [useProfile] Erreur upload:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(`avatars/${fileName}`);

      console.log('✅ [useProfile] Photo uploadée, URL:', publicUrl);

      // Mettre à jour le profil avec la nouvelle URL
      await updateProfile({ photo_url: publicUrl });

      return publicUrl;
    } catch (error: any) {
      console.error('❌ [useProfile] Erreur uploadProfilePhoto:', error.message);
      throw error;
    }
  };

  // Écouter les événements de mise à jour du profil
  useEffect(() => {
    const handleProfileUpdate = (event: any) => {
      if (event.detail && user && event.detail.id === user.id) {
        console.log('🔄 [useProfile] Mise à jour reçue via événement');
        setProfile(event.detail);
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    uploadProfilePhoto,
    createProfile
  };
}
