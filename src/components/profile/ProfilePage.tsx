import React, { useState, useEffect, useRef } from 'react';
import { Edit, Settings, LogOut, Camera, Shield, Lock, Trash2, MessageSquare, Loader2, Target, Handshake } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { SetObjectifModal } from './SetObjectifModal';
import { toast } from 'react-toastify';

type View = 'dashboard' | 'workouts' | 'planning' | 'profile' | 'sleep' | 'records' | 'groups' | 'chat' | 'video-analysis' | 'advice' | 'nutrition' | 'settings' | 'contact' | 'partnerships';

interface ProfileData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  role_specifique?: string | null;
  date_de_naissance: string | null;
  discipline: string | null;
  sexe: string | null;
  height: number | null;
  photo_url: string | null;
  license_number: string | null;
}

interface Objectif {
  id: string;
  user_id: string;
  epreuve_id: string | null;
  exercice_id: string | null;
  valeur: string;
  date_echeance: string | null;
  epreuve?: {
    nom: string;
    unite: string;
  };
  exercice?: {
    nom: string;
    unite: string;
  };
}

const ProfilePage: React.FC = () => {
  const { user, signOut, profile: authProfile, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [objectif, setObjectif] = useState<Objectif | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile as ProfileData);
    }
  }, [authProfile]);

  const loadProfileAndObjectif = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Erreur chargement profil:', profileError);
        toast.error('Erreur lors du chargement du profil');
        return;
      }

      if (profileData) {
        setProfile(profileData);
      }

      await fetchObjectif(user.id);
    } catch (error) {
      console.error('Erreur inattendue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchObjectif = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('objectifs')
        .select(`
          id,
          user_id,
          epreuve_id,
          exercice_id,
          valeur,
          date_echeance,
          epreuve:epreuves_athletisme(nom, unite),
          exercice:exercices_reference(nom, unite)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erreur chargement objectif:', error);
        return;
      }
      setObjectif(data);
    } catch (error) {
      console.error('Erreur chargement objectif:', error);
    }
  };

  const deleteOldAvatar = async (userId: string) => {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('profiles')
        .list('avatars', {
          search: userId
        });

      if (listError) {
        console.warn('⚠️ Erreur lors de la liste des anciens avatars:', listError);
        return;
      }

      if (files && files.length > 0) {
        const filesToDelete = files
          .filter(file => file.name.startsWith(userId))
          .map(file => `avatars/${file.name}`);

        if (filesToDelete.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('profiles')
            .remove(filesToDelete);

          if (deleteError) {
            console.warn('⚠️ Erreur lors de la suppression des anciens avatars:', deleteError);
          } else {
            console.log('🗑️ Anciens avatars supprimés:', filesToDelete.length);
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Erreur silencieuse lors du nettoyage des avatars:', err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille de l\'image ne doit pas dépasser 5 Mo');
      return;
    }

    setUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('📤 Upload photo vers:', filePath);

      await deleteOldAvatar(user.id);

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      console.log('✅ Upload réussi!');

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const urlWithCacheBuster = `${publicUrl}?t=${new Date().getTime()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: urlWithCacheBuster })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (profile) {
        setProfile({ ...profile, photo_url: urlWithCacheBuster });
      }

      await refreshProfile();

      try {
        toast.success('Photo de profil mise à jour avec succès !');
      } catch (toastErr) {
        console.log('✅ Photo mise à jour (toast error ignoré)');
      }

    } catch (err: any) {
      console.error('❌ Erreur upload photo:', err);
      try {
        toast.error(`Erreur lors de l'upload: ${err.message || 'Veuillez réessayer'}`);
      } catch (toastErr) {
        console.error('Erreur toast:', toastErr);
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getInitials = (p: ProfileData) => (p.first_name?.[0] || '') + (p.last_name?.[0] || '');
  const getFullName = (p: ProfileData) => `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Utilisateur';
  const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString('fr-FR') : 'Non renseigné';

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
  }
  if (!profile) {
    return <div className="flex items-center justify-center h-screen"><p>Profil non trouvé. Veuillez vous reconnecter.</p></div>;
  }

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
            {profile.photo_url ? <img src={profile.photo_url} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(profile)}
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} className="absolute -bottom-1 -right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md">
            {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            onChange={handlePhotoUpload}
            className="hidden"
          />
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
              <p className="text-gray-600 dark:text-gray-300">{objectif.epreuve?.nom || objectif.exercice?.nom}</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 my-2">{objectif.valeur} {objectif.epreuve?.unite || objectif.exercice?.unite}</p>
              {objectif.date_echeance && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Échéance : {new Date(objectif.date_echeance).toLocaleDateString('fr-FR')}
                </p>
              )}
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