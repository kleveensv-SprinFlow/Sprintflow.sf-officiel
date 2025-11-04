import React, { useState, useEffect, useRef } from 'react';
import { User, Edit, Lock, LogOut, Mail, Loader2, Camera, Trash2, Shield, Settings, MessageSquare, Handshake, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuth from '../../hooks/useAuth';
import useObjectif from '../../hooks/useObjectif';
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { SetObjectifModal } from './SetObjectifModal';
import { View, Objectif } from '../../types';
import { toast } from 'react-toastify'; // Ajout pour des notifications plus jolies

interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string;
  date_de_naissance: string | null;
  height: number | null;
  avatar_url: string | null;
  sexe: 'homme' | 'femme' | 'autre' | null;
  discipline: string | null;
  license_number: string | null;
  role: 'athlete' | 'encadrant' | null;
}

export function ProfilePage() {
  const { user, signOut, profile: authProfile, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { objectif, fetchObjectif } = useObjectif();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showObjectifModal, setShowObjectifModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadProfileAndObjectif();
    }
  }, [user]);

  const loadProfileAndObjectif = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await refreshProfile();
      await fetchObjectif(user.id);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error.message);
      toast.error("Impossible de charger toutes les données.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authProfile && user) {
      setProfile({
        ...authProfile,
        email: user.email || '',
      });
    }
  }, [authProfile]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.warn('Veuillez sélectionner un fichier image valide');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warn('La taille du fichier ne doit pas dépasser 5 MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `avatars/${user.id}.${fileExt}`;

      // Supprimer l'ancien avatar s'il existe pour éviter les orphelins
      if (profile?.avatar_url) {
          const oldAvatarPath = profile.avatar_url.split('/profiles/').pop()?.split('?')[0];
          if (oldAvatarPath) {
              await supabase.storage.from('profiles').remove([oldAvatarPath]);
          }
      }

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true }); // Upsert est plus sûr

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const urlWithCacheBuster = `${publicUrl}?t=${new Date().getTime()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: urlWithCacheBuster })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      // --- LA CORRECTION EST ICI ---
      await refreshProfile(); // On rafraîchit le contexte d'authentification global
      
      toast.success('Photo de profil mise à jour avec succès !');

    } catch (err: any) {
      console.error('❌ Erreur upload photo:', err);
      toast.error(`Erreur lors de l'upload: ${err.message || 'Veuillez réessayer'}`);
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  // Le reste du fichier reste identique mais je le fournis pour être complet

  const getInitials = (p: ProfileData) => (p.first_name?.[0] || '') + (p.last_name?.[0] || '');
  const getFullName = (p: ProfileData) => `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Utilisateur';
  const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString('fr-FR') : 'Non renseigné';

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
  }
  if (!profile) {
    return <div className="flex items-center justify-center h-screen"><p>Profil non trouvé. Veuillez vous reconnecter.</p></div>;
  }
  
  // ... (Le reste du JSX reste le même que dans le fichier original, pas besoin de le copier ici pour la lisibilité)
  // ... Je vais le remettre en entier pour vous
  
    const ProfileCard = ({ profile, onEdit }: { profile: ProfileData, onEdit: () => void }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <button onClick={onEdit} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
          <Edit className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-4 border-white dark:border-gray-800">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(profile)}
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} className="absolute -bottom-1 -right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md">
            {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getFullName(profile)}</h1>
          <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{profile.role}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 block">Date de Naissance</label>
          <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(profile.date_de_naissance)}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 block">Sexe</label>
          <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">{profile.sexe || 'N/A'}</p>
        </div>
        {profile.role === 'athlete' && (
          <>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 block">Taille</label>
              <p className="font-medium text-gray-800 dark:text-gray-200">{profile.height ? `${profile.height} cm` : 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 block">Discipline</label>
              <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">{profile.discipline || 'N/A'}</p>
            </div>
          </>
        )}
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 block">N° de License</label>
          <p className="font-medium text-gray-800 dark:text-gray-200">{profile.license_number || 'Non renseigné'}</p>
        </div>
      </div>
    </div>
  );

  const navigate = (view: View) => {
    window.dispatchEvent(new CustomEvent('change-view', { detail: view }));
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
      <ProfileCard profile={profile} onEdit={() => setShowEditModal(true)} />

      {profile?.role === 'athlete' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
            <Target className="w-6 h-6" />
            Mon Objectif
          </h2>
          {objectif ? (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">{objectif.exercice?.nom}</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 my-2">{objectif.valeur} {objectif.exercice?.unite}</p>
              <button onClick={() => setShowObjectifModal(true)} className="mt-2 text-sm text-blue-500 hover:underline">Modifier</button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Vous n'avez pas encore défini d'objectif.</p>
              <button
                onClick={() => setShowObjectifModal(true)}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Définir un objectif
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-3">
          <button onClick={() => navigate('settings')} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Paramètres</span>
            <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button onClick={() => navigate('contact')} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Contact</span>
            <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button onClick={() => navigate('partnerships')} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Partenaires</span>
            <Handshake className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
          <Shield className="w-6 h-6" />
          Sécurité
        </h2>
        <div className="space-y-3">
          <button onClick={() => setShowChangePasswordModal(true)} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Changer le mot de passe</span>
            <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button onClick={signOut} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Se déconnecter</span>
            <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button onClick={() => setShowDeleteAccountModal(true)} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-transparent hover:border-red-500 dark:hover:border-red-500 transition-colors">
            <span className="font-medium text-red-600 dark:text-red-400">Supprimer mon compte</span>
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {showEditModal && <EditProfileModal currentProfileData={profile} onClose={() => setShowEditModal(false)} onSaved={() => { setShowEditModal(false); loadProfileAndObjectif(); }} />}
      {showChangePasswordModal && <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />}
      {showDeleteAccountModal && <DeleteAccountModal onClose={() => setShowDeleteAccountModal(false)} />}
      {showObjectifModal && <SetObjectifModal onClose={() => setShowObjectifModal(false)} onSaved={() => { setShowObjectifModal(false); if(user) fetchObjectif(user.id); }} />}
    </div>
  );
}

export default ProfilePage;
