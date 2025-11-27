import React, { useState, useEffect } from 'react';
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
  Activity,
  ChevronRight,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPOSANTS UI BENTO ---

const BentoCard = ({ children, className = "", title, icon: Icon, delay = 0, onClick }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    onClick={onClick}
    className={`bg-gray-900/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col ${onClick ? 'cursor-pointer hover:bg-gray-800/60 transition-colors group' : ''} ${className}`}
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

const BentoInput = ({ label, value, onChange, type = "text", className = "", placeholder }: any) => (
  <div className="space-y-1">
    {label && <label className="text-xs text-gray-400 font-medium ml-1">{label}</label>}
    <input 
        type={type} 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className={`bg-gray-800 text-white rounded-xl px-4 py-2.5 w-full border border-gray-700 focus:border-sprint-primary focus:ring-1 focus:ring-sprint-primary outline-none transition-all ${className}`}
    />
  </div>
);

const BentoSelect = ({ label, value, onChange, options }: any) => (
  <div className="space-y-1">
    {label && <label className="text-xs text-gray-400 font-medium ml-1">{label}</label>}
    <div className="relative">
        <select 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-800 text-white rounded-xl px-4 py-2.5 w-full border border-gray-700 focus:border-sprint-primary focus:ring-1 focus:ring-sprint-primary outline-none appearance-none"
        >
            {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <ChevronRight size={16} className="rotate-90" />
        </div>
    </div>
  </div>
);

// --- MODALE D'ÉDITION COMPLÈTE ---

const EditProfileModal = ({ isOpen, onClose, profile, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<Profile>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile) setFormData(profile);
    }, [profile, isOpen]);

    const handleChange = (field: keyof Profile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />
                    
                    {/* Modal Panel */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto z-50 max-w-lg w-[90%] h-fit max-h-[85vh] bg-[#0f141e] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0f141e] sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-white">Modifier le profil</h2>
                            <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto p-6 space-y-8">
                            
                            {/* Section Identité */}
                            <section className="space-y-4">
                                <h3 className="text-sprint-primary text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <User size={16} /> Identité
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <BentoInput label="Prénom" value={formData.first_name} onChange={(v: string) => handleChange('first_name', v)} />
                                    <BentoInput label="Nom" value={formData.last_name} onChange={(v: string) => handleChange('last_name', v)} />
                                </div>
                                <BentoInput label="Date de naissance" type="date" value={formData.date_de_naissance} onChange={(v: string) => handleChange('date_de_naissance', v)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <BentoSelect 
                                        label="Genre"
                                        value={formData.sexe} 
                                        onChange={(v: string) => handleChange('sexe', v)} 
                                        options={[{value: 'homme', label: 'Homme'}, {value: 'femme', label: 'Femme'}]}
                                    />
                                    <div className="opacity-50 pointer-events-none">
                                         <BentoInput label="Pays" value="France" onChange={() => {}} disabled />
                                    </div>
                                </div>
                            </section>

                            <div className="w-full h-px bg-gray-800" />

                            {/* Section Athlète */}
                            <section className="space-y-4">
                                <h3 className="text-sprint-secondary text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Activity size={16} /> Athlète
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <BentoInput label="Taille (cm)" type="number" value={formData.height} onChange={(v: string) => handleChange('height', Number(v))} />
                                    <BentoInput label="Poids (kg)" type="number" value={formData.weight} onChange={(v: string) => handleChange('weight', Number(v))} />
                                </div>
                                <BentoInput label="Numéro de licence FFA" value={formData.license_number} onChange={(v: string) => handleChange('license_number', v)} placeholder="Ex: 123456" />
                            </section>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-800 bg-[#0f141e] sticky bottom-0 z-10">
                            <button 
                                onClick={handleSubmit} 
                                disabled={isSaving}
                                className="w-full py-3 bg-sprint-primary hover:bg-sprint-primary/90 text-white rounded-xl font-bold shadow-lg shadow-sprint-primary/20 flex justify-center items-center gap-2 transition-all"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                <span>Enregistrer les modifications</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

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
                    <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CODE..." className="bg-gray-800 text-white rounded-xl px-3 py-1.5 w-full border border-gray-700 text-center tracking-widest uppercase font-mono" />
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
                    <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CODE..." className="bg-gray-800 text-white rounded-xl px-3 py-1.5 w-full border border-gray-700 text-center tracking-widest uppercase font-mono" />
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveProfile = async (formData: Partial<Profile>) => {
    if (!profile) return;
    
    // Optimistic update
    updateProfile({ ...profile, ...formData });
    toast.success("Profil mis à jour");

    // Server update
    const { error } = await supabase.from('profiles').update(formData).eq('id', profile.id);
    if (error) {
        toast.error("Erreur de sauvegarde serveur");
        console.error(error);
    }
  };

  if (!profile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sprint-primary" size={32}/></div>;

  return (
    <div className="min-h-screen bg-sprint-dark-background text-white p-4 pt-24 pb-32">
      
      <EditProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* HEADER D'ACTION */}
      <div className="flex justify-between items-end mb-6 px-1">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
           <p className="text-gray-400 text-sm">Gère tes informations et ton équipe</p>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-all text-sm font-medium">
            <Edit2 size={16} />
            <span>Modifier</span>
        </button>
      </div>

      {/* GRILLE BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">

        {/* 1. CARTE IDENTITÉ (Large & Interactive) */}
        <BentoCard 
            className="md:col-span-2 relative overflow-hidden min-h-[180px] justify-center" 
            delay={0.1}
            onClick={() => setIsModalOpen(true)}
        >
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
                    <h2 className="text-2xl font-bold truncate group-hover:text-sprint-primary transition-colors">{profile.first_name} {profile.last_name}</h2>
                    
                    {/* MODIFICATION ICI : Remplacement Email par Licence */}
                    <div className="flex items-center gap-2 mb-2">
                        <Award size={14} className="text-gray-500" />
                        <p className={`text-sm font-mono tracking-wide ${profile.license_number ? 'text-gray-300' : 'text-gray-500 italic'}`}>
                            {profile.license_number || 'Licence : Non communiqué'}
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-medium text-gray-300">
                        <Award size={12} className="text-yellow-500" />
                        <span>{profile.discipline || 'Sprinter 100m'}</span>
                    </div>
                    
                    <div className="mt-3 text-[10px] text-sprint-primary font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Modifier le profil <ChevronRight size={12} />
                    </div>
                </div>
            </div>
        </BentoCard>

        {/* 2. STATS PHYSIQUES (Lecture seule) */}
        <BentoCard title="Physique" icon={Activity} className="md:col-span-1 space-y-4" delay={0.2}>
            <div className="grid grid-cols-2 gap-4 h-full">
                {/* Taille */}
                <div className="bg-gray-800/50 p-3 rounded-2xl flex flex-col justify-center items-center relative">
                    <Ruler size={16} className="text-gray-500 mb-1 absolute top-3 left-3" />
                    <span className="text-2xl font-bold font-mono">{profile.height || '--'}</span>
                    <span className="text-xs text-gray-400">cm</span>
                </div>
                
                {/* Poids */}
                <div className="bg-gray-800/50 p-3 rounded-2xl flex flex-col justify-center items-center relative">
                    <Weight size={16} className="text-gray-500 mb-1 absolute top-3 left-3" />
                    <span className="text-2xl font-bold font-mono">{profile.weight || '--'}</span>
                    <span className="text-xs text-gray-400">kg</span>
                </div>

                {/* Date naissance */}
                <div className="col-span-2 bg-gray-800/50 p-3 rounded-2xl flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={16} />
                        <span className="text-xs">Né(e) le</span>
                    </div>
                    <span className="font-medium text-sm">{profile.date_de_naissance ? new Date(profile.date_de_naissance).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>
        </BentoCard>

        {/* 3. INFOS COMPLÉMENTAIRES */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Email (Relégué ici car moins prioritaire visuellement que la licence pour un athlète) */}
            <BentoCard title="Contact" icon={Mail} delay={0.3}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                        <Mail size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{profile.email}</p>
                        <p className="text-xs text-gray-500">Email de connexion</p>
                    </div>
                </div>
            </BentoCard>

            {/* Localisation / Genre */}
            <BentoCard title="Infos" icon={User} delay={0.35}>
                 <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Genre</label>
                        <p className="capitalize text-sm font-medium">{profile.sexe || 'Non défini'}</p>
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