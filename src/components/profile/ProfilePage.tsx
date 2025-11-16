import React, { useState, useEffect, useRef } from 'react';
import { Edit, Settings, LogOut, Camera, Shield, Lock, Trash2, MessageSquare, Loader2, Target, Handshake, Zap, Sun, Moon, Monitor } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { SetObjectifModal } from './SetObjectifModal';
import { toast } from 'react-toastify';
import OnboardingPerformanceModal from '../dashboard/OnboardingPerformanceModal';

type View = 'dashboard' | 'workouts' | 'planning' | 'profile' | 'sleep' | 'records' | 'groups' | 'chat' | 'video-analysis' | 'advice' | 'nutrition' | 'settings' | 'contact' | 'partnerships';

// ... (interfaces ProfileData et Objectif restent identiques) ...

const ProfilePage: React.FC = () => {
  const { user, signOut, profile: authProfile, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  // ... (le reste du state et des fonctions reste identique) ...

  // ... (toute la logique de chargement, d'upload, etc. reste identique) ...

    const ProfileCard = ({ profile, onEdit }: { profile: ProfileData, onEdit: () => void }) => (
    <div className="bg-sprint-light-surface dark:bg-sprint-dark-surface rounded-2xl shadow-premium border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <button onClick={onEdit} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
          <Edit className="w-5 h-5 text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary" />
        </button>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sprint-accent to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-4 border-white dark:border-sprint-dark-surface">
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

      {/* ... (le reste du JSX avec les nouvelles classes de couleur reste identique) ... */}
    </div>
  );
}
export default ProfilePage;