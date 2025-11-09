import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

const PROFILE_COLUMNS = 'id, role, first_name, last_name, email, full_name, photo_url, height, weight, body_fat_percentage, training_frequency, dietary_preferences, personal_records, created_at, updated_at, date_de_naissance, sexe, discipline, license_number, role_specifique, phone, tour_cou_cm, tour_taille_cm, tour_hanches_cm, measurement_system, favorite_disciplines, taille_cm, sport';

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
      const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', user.id).maybeSingle();
      if (error) throw error;
      setProfile(data as Profile);
    } catch (error: any) {
      console.error('❌ [useProfile] Erreur lors du chargement:', error.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };
  
  const createProfile = async () => {
    if (!user) return;
    const newProfile = { id: user.id, role: (user.user_metadata?.role as 'coach' | 'athlete') || 'athlete', first_name: user.user_metadata?.first_name || '', last_name: user.user_metadata?.last_name || '' };
    try {
        const { data, error } = await supabase.from('profiles').insert(newProfile).select(PROFILE_COLUMNS).maybeSingle();
        if (error) throw error;
        setProfile(data as Profile);
        return data;
    } catch (error: any) {
        console.error('❌ [useProfile] Erreur lors de la création:', error.message);
        throw error;
    }
};

const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    try {
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', profile.id).select(PROFILE_COLUMNS).maybeSingle();
        if (error) throw error;
        setProfile(data as Profile);
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: data }));
        return data;
    } catch (error: any) {
        console.error('❌ [useProfile] Erreur lors de la mise à jour:', error.message);
        throw error;
    }
};

const uploadProfilePhoto = async (file: File) => {
    if (!profile) throw new Error('Profil non chargé');
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}/profile.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('profiles').upload(`avatars/${fileName}`, file, { upsert: true });
        if (uploadError) throw uploadError;
        const publicUrlWithCacheBuster = `${supabase.storage.from('profiles').getPublicUrl(`avatars/${fileName}`).data.publicUrl}?t=${new Date().getTime()}`;
        await updateProfile({ photo_url: publicUrlWithCacheBuster });
        return publicUrlWithCacheBuster;
    } catch (error: any) {
        console.error('❌ [useProfile] Erreur uploadProfilePhoto:', error.message);
        throw error;
    }
};

  useEffect(() => {
    const handleProfileUpdate = (event: any) => {
      if (event.detail && user && event.detail.id === user.id) {
        setProfile(event.detail);
      }
    };
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [user]);

  return { profile, loading, updateProfile, uploadProfilePhoto, createProfile };
}