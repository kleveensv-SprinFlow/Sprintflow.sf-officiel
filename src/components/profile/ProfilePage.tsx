import React, { useState, useEffect, useRef } from 'react';
import { User, Edit, Lock, LogOut, Calendar, Ruler, Mail, Loader2, Camera, Trash2, Shield, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EditInfoModal } from './EditInfoModal';
import { EditAthleticDataModal } from './EditAthleticDataModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteAccountModal } from './DeleteAccountModal';

interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string;
  date_de_naissance: string | null;
  taille_cm: number | null;
  taille_derniere_modif: string | null;
  avatar_url: string | null;
  sexe: 'homme' | 'femme' | null;
  sport: string | null;
  discipline: string | null;
  favorite_disciplines: any;
}

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showEditAthleticModal, setShowEditAthleticModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Erreur authentification:', authError);
        throw authError;
      }

      if (!user) {
        console.error('Aucun utilisateur connecté');
        throw new Error("User not authenticated");
      }

      console.log('User ID:', user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, full_name, date_de_naissance, taille_cm, taille_derniere_modif, avatar_url, sexe, sport, discipline, favorite_disciplines')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Erreur requête profiles:', error);
        throw error;
      }

      if (!data) {
        console.log('Profil non trouvé, création en cours...');
        const newProfile = {
          id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          full_name: user.user_metadata?.full_name || '',
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Erreur création profil:', createError);
          throw createError;
        }

        setProfile({
          ...createdProfile,
          email: user.email || '',
          avatar_url: createdProfile.avatar_url || null
        });
      } else {
        console.log('Profil trouvé:', data);
        setProfile({
          ...data,
          first_name: data.first_name || user.user_metadata?.first_name || '',
          last_name: data.last_name || user.user_metadata?.last_name || '',
          full_name: data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || '',
          email: user.email || '',
          avatar_url: data.avatar_url || null
        });
      }
    } catch (error: any) {
      console.error('Erreur chargement profil:', error.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${fileExt}`;
      await supabase.storage.from('profiles').upload(filePath, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      loadProfile();
    } catch (err) {
      console.error('Erreur upload photo:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  const getInitials = (profile: ProfileData) => {
    if (profile.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    const initials = [];
    if (profile.first_name) initials.push(profile.first_name[0]);
    if (profile.last_name) initials.push(profile.last_name[0]);
    return initials.length > 0 ? initials.join('').toUpperCase() : 'U';
  };

  const getFullName = (profile: ProfileData) => {
    if (profile.full_name) return profile.full_name;
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur';
  };
  const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString('fr-FR') : 'Non renseigné';
  const formatSport = (s: string | null) => s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Non spécifié';
  const formatDisciplines = (disciplines: any) => {
    if (!disciplines) return 'Non spécifiées';
    if (Array.isArray(disciplines)) return disciplines.join(', ') || 'Non spécifiées';
    if (typeof disciplines === 'object') return JSON.stringify(disciplines);
    return String(disciplines);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
  }
  if (!profile) {
    return <div className="flex items-center justify-center h-screen"><p>Profil non trouvé.</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(profile)}
            </div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors disabled:opacity-50">
              {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{getFullName(profile)}</h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2"><Mail className="w-4 h-4" />{profile.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Informations Personnelles */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><User className="w-5 h-5" />Informations Personnelles</h2>
              <button onClick={() => setShowEditInfoModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"><Edit className="w-4 h-4" />Modifier</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prénom</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{profile.first_name || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nom</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{profile.last_name || 'Non renseigné'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Données Athlétiques */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Target className="w-5 h-5" />Données Athlétiques</h2>
              <button onClick={() => setShowEditAthleticModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"><Edit className="w-4 h-4" />Mettre à jour</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2"><p className="text-sm text-gray-600 dark:text-gray-400">Discipline principale</p><p className="text-lg font-medium text-gray-900 dark:text-white">{profile.discipline || 'Non renseigné'}</p></div>
              <div><p className="text-sm text-gray-600 dark:text-gray-400">Date de naissance</p><p className="text-lg font-medium text-gray-900 dark:text-white">{formatDate(profile.date_de_naissance)}</p></div>
              <div><p className="text-sm text-gray-600 dark:text-gray-400">Sexe</p><p className="text-lg font-medium text-gray-900 dark:text-white">{profile.sexe === 'homme' ? 'Homme' : profile.sexe === 'femme' ? 'Femme' : 'Non spécifié'}</p></div>
              <div><p className="text-sm text-gray-600 dark:text-gray-400">Taille</p><p className="text-lg font-medium text-gray-900 dark:text-white">{profile.taille_cm ? `${profile.taille_cm} cm` : 'Non renseigné'}</p></div>
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5" />Sécurité</h2>
            <div className="space-y-3">
              <button onClick={() => setShowChangePasswordModal(true)} className="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border dark:border-gray-600 transition-colors"><span className="font-medium text-gray-900 dark:text-white">Changer le mot de passe</span><Edit className="w-4 h-4 text-gray-400" /></button>
              <button onClick={handleSignOut} className="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border dark:border-gray-600 transition-colors"><span className="font-medium text-gray-900 dark:text-white">Se déconnecter</span><LogOut className="w-4 h-4 text-gray-500" /></button>
              <button onClick={() => setShowDeleteAccountModal(true)} className="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700 transition-colors"><span className="font-medium text-red-600 dark:text-red-500">Supprimer mon compte</span><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        </div>
      </div>

      {showEditInfoModal && <EditInfoModal currentFirstName={profile.first_name || ''} currentLastName={profile.last_name || ''} onClose={() => setShowEditInfoModal(false)} onSaved={() => { setShowEditInfoModal(false); loadProfile(); }} />}
      {showEditAthleticModal && <EditAthleticDataModal currentProfileData={profile} onClose={() => setShowEditAthleticModal(false)} onSaved={() => { setShowEditAthleticModal(false); loadProfile(); }} />}
      {showChangePasswordModal && <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />}
      {showDeleteAccountModal && <DeleteAccountModal onClose={() => setShowDeleteAccountModal(false)} />}
    </div>
  );
}