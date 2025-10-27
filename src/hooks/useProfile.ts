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
      // Essayer de charger depuis Supabase avec gestion d'erreur détaillée
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
        
        // Sauvegarder en cache
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(data))
        setLoading(false);
        return;
      }
      
      if (error && error.code === 'PGRST116') {
        await createProfile();
        return;
      }
      
      throw error;
    } catch (error) {
      console.warn('Erreur chargement profil Supabase, utilisation cache local:', error?.message);
      
      // Essayer le cache local d'abord
      const localProfileData = localStorage.getItem(`profile_${user.id}`)
      if (localProfileData) {
        try {
          const parsedProfile = JSON.parse(localProfileData)
          setProfile(parsedProfile)
          setLoading(false)
          return
        } catch (parseError) {
          console.warn('Erreur parsing cache profil:', parseError)
        }
      }
      
      // Créer un profil local si Supabase échoue
      const newLocalProfile: Profile = {
        id: user.id,
        role: (user.user_metadata?.role as 'coach' | 'athlete') || 'athlete',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        photo_url: user.user_metadata?.photo_url || undefined,
        created_at: new Date().toISOString()
      };
      
      // Sauvegarder en localStorage comme fallback
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(newLocalProfile));
      setProfile(newLocalProfile);
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;
    
    const newProfile: Profile = {
      id: user.id,
      role: (user.user_metadata?.role as 'coach' | 'athlete') || 'athlete',
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      created_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Profil créé:', data);
      setProfile(data);
      // ... (code existant avant la ligne 104) ...

      if (data) {
        console.log('✅ Profil mis à jour sur Supabase:', data);
        setProfile(data);
        // Synchroniser avec les user_metadata de l'utilisateur authentifié
        try {
          const { error: userUpdateError } = await supabase.auth.updateUser({
            data: {
              first_name: updates.first_name || data.first_name,
              last_name: updates.last_name || data.last_name,
            }
          });

          if (userUpdateError) {
            console.error('❌ Erreur mise à jour user_metadata:', userUpdateError.message);
          } else {
            console.log('✅ User metadata mis à jour avec succès');
          }
        } catch (metadataError) {
          console.error('❌ Erreur synchronisation metadata:', metadataError);
        }
        
        // Synchroniser avec localStorage
        localStorage.setItem(`profile_${profile.id}`, JSON.stringify(data));
        
        // Déclencher un événement global
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: data }));
        return data;
      }

      setLoading(false);
      return data;
    } catch (error) {
      console.error('Création profil Supabase échouée, utilisation local:', error);
      
      // Fallback local
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(newProfile));
      setProfile(newProfile);
      setLoading(false);
      return newProfile;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    // Filtrer seulement les champs qui existent dans la table profiles
    const allowedFields = ['first_name', 'last_name', 'photo_url'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key) && updates[key] !== undefined && updates[key] !== '')
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);
    
    const updatedProfile = { 
      ...profile, 
      ...filteredUpdates,
      updated_at: new Date().toISOString()
    };

    try {
      // Essayer Supabase d'abord
      const { data, error } = await supabase
        .from('profiles')
        .update(filteredUpdates)
        .eq('id', profile.id)
        .select()
        .single();
      
      if (data) {
        setProfile(data);
        
        // Synchroniser avec les user_metadata de l'utilisateur authentifié
        try {
          const metadataUpdate = {
            first_name: filteredUpdates.first_name || data.first_name,
            last_name: filteredUpdates.last_name || data.last_name,
          };
          
          const { error: userUpdateError } = await supabase.auth.updateUser({
            data: metadataUpdate
          });

          if (userUpdateError) {
            console.error('Erreur mise à jour user_metadata:', userUpdateError.message);
          }
        } catch (metadataError) {
          console.error('Erreur synchronisation metadata:', metadataError);
        }
        
        // Synchroniser avec localStorage
        localStorage.setItem(`profile_${profile.id}`, JSON.stringify(data));
        
        // Déclencher un événement global
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: data }));
        return data;
      }
      
      throw error;
    } catch (error) {
      console.error('Mise à jour Supabase échouée, sauvegarde locale:', error);
      
      // Fallback local
      localStorage.setItem(`profile_${profile.id}`, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      
      // Déclencher un événement global
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: updatedProfile }));
      return updatedProfile;
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    if (!profile) throw new Error('Profil non chargé');
    
    try {
      // Créer une URL locale pour l'aperçu immédiat
      const localUrl = URL.createObjectURL(file);
      
      // Mettre à jour immédiatement l'interface
      await updateProfile({ photo_url: localUrl });
      
      // Essayer l'upload Supabase en arrière-plan
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}/avatar.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, file, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);
        
        // Remplacer l'URL locale par l'URL Supabase
        await updateProfile({ photo_url: publicUrl });
        
        // Nettoyer l'URL locale
        URL.revokeObjectURL(localUrl);
        
        return publicUrl;
      } catch (supabaseError) {
        console.error('Upload Supabase échoué, conservation URL locale:', supabaseError);
        // Garder l'URL locale si Supabase échoue
        return localUrl;
      }
    } catch (error) {
      console.error('Erreur uploadProfilePhoto:', error);
      throw error;
    }
  };

  // Charger depuis localStorage au démarrage si Supabase échoue
  useEffect(() => {
    if (user && !profile && !loading) {
      const localProfileData = localStorage.getItem(`profile_${user.id}`)
      if (localProfileData) {
        try {
          const parsedProfile = JSON.parse(localProfileData)
          setProfile(parsedProfile);
        } catch (error) {
          console.error('Erreur parsing profil local:', error);
        }
      }
    }
  }, [user, profile, loading]);

  // Écouter les événements de mise à jour du profil
  useEffect(() => {
    const handleProfileUpdate = (event: any) => {
      if (event.detail && user && event.detail.id === user.id) {
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