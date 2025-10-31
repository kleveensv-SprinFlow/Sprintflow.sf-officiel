import React, { useState, useEffect, useRef } from 'react';
import { User, Edit, Lock, LogOut, Mail, Loader2, Camera, Trash2, Shield, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth'; // Import useAuth pour signOut
import { EditInfoModal } from './EditInfoModal';
import { EditAthleticDataModal } from './EditAthleticDataModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteAccountModal } from './DeleteAccountModal';

// Définition de l'interface pour les données du profil
interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string; // Ajout de l'email pour l'affichage
  date_de_naissance: string | null;
  taille_cm: number | null;
  avatar_url: string | null;
  sexe: 'homme' | 'femme' | null;
  discipline: string | null;
}

export function ProfilePage() {
  const { signOut } = useAuth();
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      // La logique de création de profil a été déplacée dans useAuth.ts.
      // Ici, on s'attend à ce que le profil existe TOUJOURS.
      // On utilise .single() pour lever une erreur si ce n'est pas le cas.
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, full_name, date_de_naissance, taille_cm, avatar_url, sexe, discipline')
        .eq('id', user.id)
        .single(); // .single() au lieu de .maybeSingle()

      if (error) throw error;

      // On combine les données du profil avec l'email de l'utilisateur (qui vient de 'auth')
      setProfile({
        ...data,
        email: user.email || '',
      });

    } catch (error: any) {
      console.error('Erreur lors du chargement du profil:', error.message);
      // Gérer l'erreur, par exemple afficher un message à l'utilisateur
    } finally {
      setIsLoading(false);
    }
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

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      const urlWithCacheBuster = `${publicUrl}?t=${new Date().getTime()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithCacheBuster })
        .eq('id', user.id);
      if (updateError) throw updateError;

      // Mettre à jour l'état local pour un affichage immédiat
      setProfile(prevProfile => prevProfile ? { ...prevProfile, avatar_url: urlWithCacheBuster } : null);

    } catch (err: any) {
      console.error('Erreur upload photo:', err);
      alert(`Erreur lors de l'upload: ${err.message || 'Veuillez réessayer'}`);
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  const getInitials = (p: ProfileData) => {
    return (p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim())
      .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '...';
  };
  
  const getFullName = (p: ProfileData) => {
    return p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Utilisateur';
  };

  const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString('fr-FR') : 'Non renseigné';

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
  }
  if (!profile) {
    return <div className="flex items-center justify-center h-screen"><p>Profil non trouvé. Veuillez contacter le support.</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : getInitials(profile)}
            </div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full">
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
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><User />Informations Personnelles</h2>
              <button onClick={() => setShowEditInfoModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><Edit className="w-4 h-4" />Modifier</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-600">Prénom</p><p className="font-medium">{profile.first_name || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-600">Nom</p><p className="font-medium">{profile.last_name || 'N/A'}</p></div>
              <div className="col-span-2"><p className="text-sm text-gray-600">Email</p><p className="font-medium">{profile.email}</p></div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Target />Données Athlétiques</h2>
              <button onClick={() => setShowEditAthleticModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"><Edit className="w-4 h-4" />Mettre à jour</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2"><p className="text-sm">Discipline</p><p className="font-medium">{profile.discipline || 'N/A'}</p></div>
              <div><p className="text-sm">Date de naissance</p><p className="font-medium">{formatDate(profile.date_de_naissance)}</p></div>
              <div><p className="text-sm">Sexe</p><p className="font-medium">{profile.sexe || 'N/A'}</p></div>
              <div><p className="text-sm">Taille</p><p className="font-medium">{profile.taille_cm ? `${profile.taille_cm} cm` : 'N/A'}</p></div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Shield />Sécurité</h2>
            <div className="space-y-3">
              <button onClick={() => setShowChangePasswordModal(true)} className="w-full flex justify-between items-center p-4 bg-white rounded-lg border"><span className="font-medium">Changer le mot de passe</span><Edit className="w-4 h-4" /></button>
              <button onClick={signOut} className="w-full flex justify-between items-center p-4 bg-white rounded-lg border"><span className="font-medium">Se déconnecter</span><LogOut className="w-4 h-4" /></button>
              <button onClick={() => setShowDeleteAccountModal(true)} className="w-full flex justify-between items-center p-4 bg-white rounded-lg border hover:border-red-500"><span className="font-medium text-red-600">Supprimer mon compte</span><Trash2 className="w-4 h-4 text-red-500" /></button>
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