import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { Profile } from '../../types';
import { useGroups } from '../../hooks/useGroups';
import { usePersonalCoach } from '../../hooks/usePersonalCoach';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { 
  Loader2, 
  Edit2, 
  Save, 
  X, 
  User, 
  Ruler, 
  Weight, 
  Award, 
  Users, 
  LogOut,
  Calendar,
  MapPin,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- COMPOSANTS UI BENTO ---

// Une "Tuile" Bento générique
const BentoCard = ({ children, className = "", title, icon: Icon, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`bg-gray-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col ${className}`}
  >
    {title && (
      <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase text-xs font-bold tracking-wider">
        {Icon && <Icon size={14} />}
        <span>{title}</span>
      </div>
    )}
    {children}
  </motion.div>
);

// Champ de saisie stylisé pour le mode sombre
const BentoInput = ({ value, onChange, type = "text", className = "" }: any) => (
  <input 
    type={type} 
    value={value || ''} 
    onChange={(e) => onChange(e.target.value)} 
    className={`bg-gray-800 text-white rounded-xl px-3 py-1.5 w-full border border-gray-700 focus:border-sprint-primary focus:ring-1 focus:ring-sprint-primary outline-none transition-all ${className}`}
  />
);

// Sélecteur stylisé
const BentoSelect = ({ value, onChange, options }: any) => (
  <select 
    value={value || ''} 
    onChange={(e) => onChange(e.target.value)}
    className="bg-gray-800 text-white rounded-xl px-3 py-1.5 w-full border border-gray-700 focus:border-sprint-primary focus:ring-1 focus:ring-sprint-primary outline-none appearance-none"
  >
    {options.map((opt: any) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

// --- SOUS-COMPOSANTS LOGIQUES ---

const GroupWidget = () => {
    const { groups, isLoading } = useGroups();
    const userGroup = groups.length > 0 ? groups[0] : null;
    const [code, setCode] = useState('');
    const [isActing, setIsActing] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!code) return;
        setIsActing(true);
        const { data, error } = await supabase.rpc('join_group_with_code', { p_invitation_code: code });
        if (error) toast.error(error.message);
        else toast.success(data.message);
        setIsActing(false);
        setCode('');
    };

    const handleLeave = async () => {
        if(!userGroup) return;
        if(!window.confirm("Quitter ce groupe ?")) return;
        setIsActing(true);
        await supabase.rpc('leave_group', { p_group_id: userGroup.id });
        setIsActing(false);
    };

    if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-gray-500"/></div>;

    if (!userGroup) {
        return (
            <form onSubmit={handleJoin} className="flex flex-col gap-2 h-full justify-center">
                <p className="text-sm text-gray-400 mb-1">Rejoindre une team</p>
                <div className="flex gap-2">
                    <BentoInput value={code} onChange={setCode} placeholder="CODE..." className="text-center tracking-widest uppercase font-mono" />
                    <button disabled={isActing} className="bg-sprint-primary p-2 rounded-xl text-white hover:bg-sprint-primary/80 transition-colors">
                        {isActing ? <Loader2 size={18} className="animate-spin"/> : <Users size={18} />}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="flex items-center justify-between h-full">
            <div>
                <h4 className="font-bold text-lg text-white">{userGroup.name}</h4>
                <p className="text-xs text-gray-400">{userGroup.member_count} athlètes</p>
            </div>
            <button onClick={handleLeave} disabled={isActing} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors">
                <LogOut size={18} />
            </button>
        </div>
    );
};

const CoachWidget = () => {
    const { personalCoach, isLoading, joinCoach, leaveCoach } = usePersonalCoach();
    const [code, setCode] = useState('');
    const [isActing, setIsActing] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!code) return;
        setIsActing(true);
        const res = await joinCoach(code);
        if(res.success) toast.success(res.message);
        else toast.error(res.message);
        setIsActing(false);
        setCode('');
    };

    const handleLeave = async () => {
        if(!personalCoach) return;
        if(!window.confirm("Arrêter le suivi avec ce coach ?")) return;
        setIsActing(true);
        await leaveCoach(personalCoach.id);
        setIsActing(false);
    };

    if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-gray-500"/></div>;

    if (!personalCoach) {
        return (
            <form onSubmit={handleJoin} className="flex flex-col gap-2 h-full justify-center">
                <p className="text-sm text-gray-400 mb-1">Ajouter un coach</p>
                <div className="flex gap-2">
                    <BentoInput value={code} onChange={setCode} placeholder="CODE..." className="text-center tracking-widest uppercase font-mono" />
                    <button disabled={isActing} className="bg-sprint-secondary p-2 rounded-xl text-white hover:bg-sprint-secondary/80 transition-colors">
                        {isActing ? <Loader2 size={18} className="animate-spin"/> : <User size={18} />}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
                <img src={personalCoach.photo_url || ''} alt="Coach" className="w-10 h-10 rounded-full border border-gray-600 object-cover" />
                <div>
                    <h4 className="font-bold text-white text-sm">{personalCoach.full_name}</h4>
                    <span className="text-[10px] bg-sprint-primary/20 text-sprint-primary px-2 py-0.5 rounded-full font-medium">COACH</span>
                </div>
            </div>
            <button onClick={handleLeave} disabled={isActing} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors">
                <LogOut size={18} />
            </button>
        </div>
    );
};

// --- PAGE PRINCIPALE ---

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  // Initialisation du formulaire quand on passe en mode édition
  const startEditing = () => {
    if (profile) {
      setFormData(profile);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData({});
  };

  const saveChanges = async () => {
    if (!profile || !formData) return;
    
    // Optimistic update
    updateProfile({ ...profile, ...formData });
    setIsEditing(false);
    toast.success("Profil mis à jour");

    // Server update
    const { error } = await supabase.from('profiles').update(formData).eq('id', profile.id);
    if (error) {
        toast.error("Erreur de sauvegarde serveur");
        console.error(error);
    }
  };

  const updateField = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!profile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sprint-primary" size={32}/></div>;

  return (
    <div className="min-h-screen bg-sprint-dark-background text-white p-4 pt-24 pb-32">
      
      {/* HEADER D'ACTION */}
      <div className="flex justify-between items-end mb-6 px-1">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
           <p className="text-gray-400 text-sm">Gère tes informations et ton équipe</p>
        </div>
        
        {isEditing ? (
            <div className="flex gap-2">
                <button onClick={cancelEditing} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors">
                    <X size={20} />
                </button>
                <button onClick={saveChanges} className="flex items-center gap-2 px-4 py-2 rounded-full bg-sprint-primary text-white font-medium hover:bg-sprint-primary/90 transition-all shadow-lg shadow-sprint-primary/20">
                    <Save size={18} />
                    <span>Enregistrer</span>
                </button>
            </div>
        ) : (
            <button onClick={startEditing} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-all text-sm font-medium">
                <Edit2 size={16} />
                <span>Modifier</span>
            </button>
        )}
      </div>

      {/* GRILLE BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">

        {/* 1. CARTE IDENTITÉ (Large) */}
        <BentoCard className="md:col-span-2 relative overflow-hidden min-h-[180px] justify-center" delay={0.1}>
            {/* Background décoratif */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sprint-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex items-center gap-6 relative z-10">
                <div className="relative">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                        <img src={profile.photo_url || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    {/* Badge Discipline */}
                    <div className="absolute -bottom-3 -right-3 bg-gray-900 border border-gray-700 p-1.5 rounded-lg shadow-sm">
                        <Activity size={16} className="text-sprint-primary" />
                    </div>
                </div>
                
                <div className="flex-1">
                    {isEditing ? (
                        <div className="space-y-2">
                            <BentoInput value={formData.first_name} onChange={(v: string) => updateField('first_name', v)} placeholder="Prénom" />
                            <BentoInput value={formData.last_name} onChange={(v: string) => updateField('last_name', v)} placeholder="Nom" />
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold truncate">{profile.first_name} {profile.last_name}</h2>
                            <p className="text-gray-400 text-sm mb-2">{profile.email}</p>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-medium text-gray-300">
                                <Award size={12} className="text-yellow-500" />
                                <span>{profile.discipline || 'Sprinter 100m'}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </BentoCard>

        {/* 2. STATS PHYSIQUES (Vertical Stack) */}
        <BentoCard title="Physique" icon={Activity} className="md:col-span-1 space-y-4" delay={0.2}>
            <div className="grid grid-cols-2 gap-4 h-full">
                {/* Taille */}
                <div className="bg-gray-800/50 p-3 rounded-2xl flex flex-col justify-center items-center relative group">
                    <Ruler size={16} className="text-gray-500 mb-1 absolute top-3 left-3" />
                    {isEditing ? (
                        <BentoInput type="number" value={formData.height} onChange={(v: string) => updateField('height', Number(v))} className="text-center font-bold" />
                    ) : (
                        <span className="text-2xl font-bold font-mono">{profile.height || '--'}</span>
                    )}
                    <span className="text-xs text-gray-400">cm</span>
                </div>
                
                {/* Poids */}
                <div className="bg-gray-800/50 p-3 rounded-2xl flex flex-col justify-center items-center relative group">
                    <Weight size={16} className="text-gray-500 mb-1 absolute top-3 left-3" />
                    {isEditing ? (
                        <BentoInput type="number" value={formData.weight} onChange={(v: string) => updateField('weight', Number(v))} className="text-center font-bold" />
                    ) : (
                        <span className="text-2xl font-bold font-mono">{profile.weight || '--'}</span>
                    )}
                    <span className="text-xs text-gray-400">kg</span>
                </div>

                {/* Date naissance */}
                <div className="col-span-2 bg-gray-800/50 p-3 rounded-2xl flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={16} />
                        <span className="text-xs">Né(e) le</span>
                    </div>
                    {isEditing ? (
                        <BentoInput type="date" value={formData.date_de_naissance} onChange={(v: string) => updateField('date_de_naissance', v)} className="w-auto text-sm" />
                    ) : (
                        <span className="font-medium text-sm">{new Date(profile.date_de_naissance || Date.now()).toLocaleDateString()}</span>
                    )}
                </div>
            </div>
        </BentoCard>

        {/* 3. ADMINISTRATIF & PERFORMANCE (Full Width) */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Licence */}
            <BentoCard title="Licence FFA" icon={Award} delay={0.3}>
                <div className="flex items-center gap-3 mt-1">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Award size={20} />
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <BentoInput value={formData.license_number} onChange={(v: string) => updateField('license_number', v)} placeholder="Numéro de licence" />
                        ) : (
                            <>
                                <p className="text-lg font-mono tracking-wide">{profile.license_number || 'Aucune licence'}</p>
                                <p className="text-xs text-gray-500">Saison 2024-2025</p>
                            </>
                        )}
                    </div>
                </div>
            </BentoCard>

            {/* Localisation / Genre */}
            <BentoCard title="Infos" icon={User} delay={0.35}>
                 <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Genre</label>
                        {isEditing ? (
                            <BentoSelect 
                                value={formData.sexe} 
                                onChange={(v: string) => updateField('sexe', v)} 
                                options={[{value: 'homme', label: 'Homme'}, {value: 'femme', label: 'Femme'}]}
                            />
                        ) : (
                            <p className="capitalize text-sm">{profile.sexe || 'Non défini'}</p>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Pays</label>
                        <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-gray-500"/>
                            <span className="text-sm">France</span>
                        </div>
                    </div>
                 </div>
            </BentoCard>
        </div>

        {/* 4. ÉQUIPE (Team & Coach) */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <BentoCard title="Mon Groupe" icon={Users} delay={0.4} className="border-l-4 border-l-sprint-primary">
                <GroupWidget />
            </BentoCard>

            <BentoCard title="Mon Coach" icon={User} delay={0.45} className="border-l-4 border-l-sprint-secondary">
                <CoachWidget />
            </BentoCard>
        </div>

      </div>
    </div>
  );
}