import React, { useState, useEffect, useRef } from 'react';
import { Edit, Camera, Shield, Lock, Trash2, Loader2, Target, Sun, Moon, Monitor, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { LanguageSelector } from '../LanguageSelector';

// Dans le JSX, après la section Theme
<div className="space-y-3">
  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Langue de Sprinty
  </h3>
  <LanguageSelector />
</div>
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { SetObjectifModal } from './SetObjectifModal';
import { toast } from 'react-toastify';
import OnboardingPerformanceModal from '../dashboard/OnboardingPerformanceModal';

interface ProfileData {
  id: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  date_de_naissance?: string;
  sexe?: string;
  height?: number;
  discipline?: string;
  license_number?: string;
  role?: string;
  photo_url?: string;
}

interface Objectif {
  id: string;
  titre: string;
  description?: string;
  date_limite?: string;
  progres: number;
  statut: string;
}

const ProfilePage: React.FC = () => {
  const { user, signOut, profile: authProfile, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showObjectifModal, setShowObjectifModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authProfile) {
      setProfile({
        id: authProfile.id,
        email: user?.email,
        full_name: authProfile.full_name,
        first_name: authProfile.first_name,
        last_name: authProfile.last_name,
        date_de_naissance: authProfile.date_de_naissance,
        sexe: authProfile.sexe,
        height: authProfile.height,
        discipline: authProfile.discipline,
        license_number: authProfile.license_number,
        role: authProfile.role,
        photo_url: authProfile.photo_url
      });
    }
  }, [authProfile, user]);

  useEffect(() => {
    if (user) {
      loadObjectifs();
    }
  }, [user]);

  const loadObjectifs = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('objectifs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setObjectifs(data);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateProfile({ photo_url: publicUrlData.publicUrl });
      setProfile(prev => prev ? { ...prev, photo_url: publicUrlData.publicUrl } : null);
      toast.success('Photo de profil mise à jour !');
    } catch (error: any) {
      toast.error('Erreur lors du téléchargement de la photo');
      console.error(error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (updates: Partial<ProfileData>) => {
    try {
      await updateProfile(updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profil mis à jour !');
      setShowEditModal(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await supabase.auth.admin.deleteUser(user!.id);
      await signOut();
      toast.success('Compte supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte');
    }
  };

  const handleAddObjectif = async (objectif: Omit<Objectif, 'id'>) => {
    if (!user) return;
    const { error } = await supabase.from('objectifs').insert({ ...objectif, user_id: user.id });
    if (!error) {
      toast.success('Objectif ajouté !');
      loadObjectifs();
      setShowObjectifModal(false);
    } else {
      toast.error('Erreur lors de l\'ajout de l\'objectif');
    }
  };

  const getInitials = (prof: ProfileData | null) => {
    if (!prof) return '?';
    const first = prof.first_name?.[0] || prof.full_name?.[0] || '';
    const last = prof.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const getFullName = (prof: ProfileData | null) => {
    if (!prof) return 'Utilisateur';
    return prof.full_name || `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || 'Utilisateur';
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const ProfileCard = ({ profile, onEdit }: { profile: ProfileData | null, onEdit: () => void }) => {
    if (!profile) return null;
    
    return (
      <div className="bg-sprint-light-surface dark:bg-sprint-dark-surface rounded-2xl shadow-premium border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <button onClick={onEdit} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <Edit className="w-5 h-5 text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary" />
          </button>
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sprint-accent to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-4 border-white dark:border-gray-700">
              {profile.photo_url ? <img src={profile.photo_url} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(profile)}
            </div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} className="absolute -bottom-1 -right-1 p-2 bg-sprint-accent hover:bg-blue-700 text-white rounded-full shadow-md">
              {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif" onChange={handlePhotoUpload} className="hidden" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">{getFullName(profile)}</h1>
            <p className="text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary">{profile.email}</p>
            <p className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary capitalize">{profile.role}</p>
          </div>
        </div>
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary block">Date de Naissance</label>
            <p className="font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">{formatDate(profile.date_de_naissance)}</p>
          </div>
          <div>
            <label className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary block">Sexe</label>
            <p className="font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary capitalize">{profile.sexe || 'N/A'}</p>
          </div>
          {profile.role === 'athlete' && (
            <>
              <div>
                <label className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary block">Taille</label>
                <p className="font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">{profile.height ? `${profile.height} cm` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary block">Discipline</label>
                <p className="font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary capitalize">{profile.discipline || 'N/A'}</p>
              </div>
            </>
          )}
          <div>
            <label className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary block">N° de License</label>
            <p className="font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">{profile.license_number || 'Non renseigné'}</p>
          </div>
        </div>
      </div>
    );
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
      <ProfileCard profile={profile} onEdit={() => setShowEditModal(true)} />

      <div className="bg-sprint-light-surface dark:bg-sprint-dark-surface rounded-lg shadow-premium border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-sprint-light-text-primary dark:text-sprint-dark-text-primary">Apparence</h2>
        <div className="flex justify-around rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
          <button onClick={() => setTheme('light')} className={`flex-1 p-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-white shadow text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>
            <Sun className="w-4 h-4" /> Clair
          </button>
          <button onClick={() => setTheme('dark')} className={`flex-1 p-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-gray-800 shadow text-white' : 'text-gray-600 dark:text-gray-300'}`}>
            <Moon className="w-4 h-4" /> Sombre
          </button>
          <button onClick={() => setTheme('system')} className={`flex-1 p-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${theme === 'system' ? 'bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
            <Monitor className="w-4 h-4" /> Système
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-4 p-4 bg-sprint-light-surface dark:bg-sprint-dark-surface rounded-lg shadow hover:shadow-lg">
          <Lock className="w-5 h-5" />
          <span className="font-semibold">Changer le mot de passe</span>
        </button>
        <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
          <Trash2 className="w-5 h-5" />
          <span className="font-semibold">Supprimer mon compte</span>
        </button>
        <button onClick={signOut} className="w-full flex items-center gap-4 p-4 bg-sprint-light-surface dark:bg-sprint-dark-surface rounded-lg shadow hover:shadow-lg">
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Déconnexion</span>
        </button>
      </div>

      {showEditModal && <EditProfileModal profile={profile} onSave={handleSaveProfile} onClose={() => setShowEditModal(false)} />}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {showDeleteModal && <DeleteAccountModal onConfirm={handleDeleteAccount} onClose={() => setShowDeleteModal(false)} />}
      {showObjectifModal && <SetObjectifModal onSave={handleAddObjectif} onClose={() => setShowObjectifModal(false)} />}
      {showOnboardingModal && <OnboardingPerformanceModal onClose={() => setShowOnboardingModal(false)} />}
    </div>
  );
};

export default ProfilePage;