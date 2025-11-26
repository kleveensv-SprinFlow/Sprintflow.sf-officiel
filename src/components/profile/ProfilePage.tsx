import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { Profile } from '../../types';
import { useGroups } from '../../hooks/useGroups';
import { usePersonalCoach } from '../../hooks/usePersonalCoach';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

// --- Composants de champ éditable (inchangés) ---
const EditableProfileField = ({ label, value, type = 'text', onSave }: { label: string; value: string; type?: string; onSave: (newValue: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const handleSave = () => { onSave(currentValue); setIsEditing(false); };
  if (isEditing) { return <input type={type} value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} onBlur={handleSave} autoFocus className="w-full bg-transparent border-b-2 border-accent text-lg focus:outline-none text-white"/>; }
  return <div onClick={() => setIsEditing(true)} className="p-2 -mx-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors"><p className="text-xs text-gray-400 capitalize">{label}</p><p className="text-lg">{value || 'Non défini'}</p></div>;
};
const EditableSelectField = ({ label, value, options, onSave }: { label: string; value: string; options: {value: string, label: string}[]; onSave: (newValue: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const handleSave = (newValue: string) => { onSave(newValue); setIsEditing(false); };
    if (isEditing) { return <select value={value} onChange={(e) => handleSave(e.target.value)} onBlur={() => setIsEditing(false)} autoFocus className="w-full bg-gray-700 border-accent text-lg focus:outline-none text-white rounded-md p-2 mt-1">{options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>; }
    return <div onClick={() => setIsEditing(true)} className="p-2 -mx-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors"><p className="text-xs text-gray-400 capitalize">{label}</p><p className="text-lg capitalize">{value || 'Non défini'}</p></div>;
};

// --- Section pour rejoindre via un code ---
const JoinSection = ({ placeholder, onJoin, isLoading }: { placeholder: string; onJoin: (code: string) => Promise<any>; isLoading: boolean }) => {
    const [code, setCode] = useState('');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;
        const result = await onJoin(code);
        if (result.success) {
            toast.success(result.message);
            setCode('');
        } else {
            toast.error(result.message);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={placeholder} className="flex-grow bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
            <button type="submit" disabled={isLoading} className="bg-accent text-white font-bold py-2 px-4 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Rejoindre'}
            </button>
        </form>
    );
};

// --- Section d'affichage du groupe ---
const GroupSection = () => {
    const { groups, isLoading } = useGroups();
    const [isLeaving, setIsLeaving] = useState(false);
    const userGroup = groups.length > 0 ? groups[0] : null;

    const handleLeaveGroup = async () => {
        if (!userGroup) return;
        setIsLeaving(true);
        const { data, error } = await supabase.rpc('leave_group', { p_group_id: userGroup.id });
        if (error || !data.success) {
            toast.error(error?.message || data.message || "Erreur en quittant le groupe.");
        } else {
            toast.success(data.message);
            // Re-fetch des groupes est géré par SWR dans le hook
        }
        setIsLeaving(false);
    };

    const handleJoinGroup = async (code: string) => {
        const { data, error } = await supabase.rpc('join_group_with_code', { p_invitation_code: code });
        if (error) return { success: false, message: error.message };
        return data;
    };
    
    if (isLoading) return <div className="text-center"><Loader2 className="animate-spin inline-block"/></div>;

    if (!userGroup) {
        return <JoinSection placeholder="Code du groupe" onJoin={handleJoinGroup} isLoading={isLeaving} />;
    }

    return (
        <div>
            <h4 className="font-bold text-lg">{userGroup.name}</h4>
            <p className="text-sm text-gray-400">{userGroup.member_count} membre(s)</p>
            <button onClick={handleLeaveGroup} disabled={isLeaving} className="mt-2 text-sm text-red-500 hover:underline disabled:opacity-50">
                {isLeaving ? 'Départ...' : 'Quitter le groupe'}
            </button>
        </div>
    );
};

// --- Section d'affichage du coach personnel ---
const CoachSection = () => {
    const { personalCoach, isLoading, joinCoach, leaveCoach } = usePersonalCoach();
    const [isLeaving, setIsLeaving] = useState(false);

    const handleLeave = async () => {
        if (!personalCoach) return;
        setIsLeaving(true);
        const result = await leaveCoach(personalCoach.id);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
        setIsLeaving(false);
    };

    if (isLoading) return <div className="text-center"><Loader2 className="animate-spin inline-block"/></div>;

    if (!personalCoach) {
        return <JoinSection placeholder="Code du coach" onJoin={joinCoach} isLoading={isLeaving} />;
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <img src={personalCoach.photo_url || ''} alt={personalCoach.full_name || 'Coach'} className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <h4 className="font-bold">{personalCoach.full_name}</h4>
                    <p className="text-sm text-gray-400">Coach Personnel</p>
                </div>
            </div>
            <button onClick={handleLeave} disabled={isLeaving} className="text-sm text-red-500 hover:underline disabled:opacity-50">
                {isLeaving ? 'Départ...' : 'Quitter'}
            </button>
        </div>
    );
};


// --- Composant principal de la page de profil ---
export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();

  const handleFieldSave = (field: keyof Profile) => async (newValue: string | number) => {
    if (!profile) return;
    updateProfile({ ...profile, [field]: newValue });
    const { error } = await supabase.from('profiles').update({ [field]: newValue }).eq('id', profile.id);
    if (error) {
      toast.error("Erreur lors de la sauvegarde.");
      // Optionnel: Revert local state on error
    } else {
      toast.success("Profil mis à jour !");
    }
  };
  
  const genderOptions = [ { value: 'homme', label: 'Homme' }, { value: 'femme', label: 'Femme' }, { value: 'autre', label: 'Autre' }];

  if (!profile) return <div className="pt-20 text-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-sprint-dark-background text-white pt-20 p-4">
      <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-800/50 mb-8">
        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-accent/50">
          <img src={profile.photo_url || ''} alt="Profil" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h2>
          <p className="text-sm text-gray-400">{profile.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-400 border-b border-gray-700 pb-2 mb-4">Informations Personnelles</h3>
        <EditableProfileField label="Prénom" value={profile.first_name || ''} onSave={handleFieldSave('first_name')} />
        <EditableProfileField label="Nom" value={profile.last_name || ''} onSave={handleFieldSave('last_name')} />
        <EditableProfileField label="Date de Naissance" value={profile.date_de_naissance || ''} type="date" onSave={handleFieldSave('date_de_naissance')} />
        <EditableSelectField label="Genre" value={profile.sexe || ''} options={genderOptions} onSave={handleFieldSave('sexe')} />
        <EditableProfileField label="Pays" value={"France"} onSave={() => {}} />
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-md font-semibold text-gray-400 border-b border-gray-700 pb-2 mb-4">Informations Athlète</h3>
        <EditableProfileField label="Numéro de licence" value={profile.license_number || ''} onSave={handleFieldSave('license_number')} />
        <EditableProfileField label="Taille (cm)" value={String(profile.height || '')} type="number" onSave={(val) => handleFieldSave('height')(Number(val))} />
        <EditableProfileField label="Poids (kg)" value={String(profile.weight || '')} type="number" onSave={(val) => handleFieldSave('weight')(Number(val))} />
      </div>

      <div className="mt-10">
        <h3 className="text-md font-semibold text-gray-400 border-b border-gray-700 pb-2 mb-4">Connexions</h3>
        <div className="p-4 mt-2 rounded-lg bg-gray-800/50"><GroupSection /></div>
        <div className="p-4 mt-4 rounded-lg bg-gray-800/50"><CoachSection /></div>
      </div>
    </div>
  );
}
