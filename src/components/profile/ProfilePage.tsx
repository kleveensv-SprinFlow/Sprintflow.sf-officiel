import React from 'react';
import useAuth from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { CoachProfile } from './coach/CoachProfile';
import { AthleteProfile } from './athlete/AthleteProfile';
import { Profile } from '../../types';

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();

  const handleSaveProfile = async (formData: Partial<Profile>) => {
    if (!profile) return;
    updateProfile({ ...profile, ...formData });
    toast.success("Profil mis à jour");
    const { error } = await supabase.from('profiles').update(formData).eq('id', profile.id);
    if (error) console.error(error);
  };

  if (!profile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-white" size={32}/></div>;

  const isCoach = profile.role === 'coach';

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24 pb-32">
        {isCoach ? (
            <CoachProfile profile={profile} onUpdateProfile={handleSaveProfile} />
        ) : (
            <AthleteProfile profile={profile} onUpdateProfile={handleSaveProfile} />
        )}
    </div>
  );
}
