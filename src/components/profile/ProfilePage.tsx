import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { Profile } from '../../types';
import { useGroups } from '../../hooks/useGroups';
import { usePersonalCoach } from '../../hooks/usePersonalCoach';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { 
  Loader2, 
  X, 
  Save, 
  User, 
  ChevronRight,
  Activity,
  Users,
  LogOut,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPOSANTS UI MINIMALISTES ---

const MinimalCard = ({ children, onClick, className = "" }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`bg-[#12141a] border border-white/5 rounded-2xl p-6 transition-all ${onClick ? 'cursor-pointer active:scale-[0.99] hover:bg-[#1a1d26]' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

const ModalInput = ({ label, value, onChange, type = "text", disabled = false }: any) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">{label}</label>
    <input 
        type={type} 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        disabled={disabled}
        className="bg-[#0a0b10] text-white text-lg rounded-xl px-4 py-3 w-full border border-gray-800 focus:border-sprint-primary focus:ring-1 focus:ring-sprint-primary outline-none transition-all disabled:opacity-50"
    />
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
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 z-50 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 md:inset-0 md:m-auto z-50 w-full md:max-w-lg md:h-fit md:rounded-3xl h-[90vh] rounded-t-3xl bg-[#12141a] overflow-hidden flex flex-col border border-white/10"
                    >
                        {/* Header Modal */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#12141a]">
                            <h2 className="text-xl font-bold text-white">Éditer le profil</h2>
                            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-6 space-y-8 flex-1">
                            {/* Identité */}
                            <section className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <ModalInput label="Prénom" value={formData.first_name} onChange={(v: string) => handleChange('first_name', v)} />
                                    <ModalInput label="Nom" value={formData.last_name} onChange={(v: string) => handleChange('last_name', v)} />
                                </div>
                                <ModalInput label="Email" value={formData.email} onChange={() => {}} disabled />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Genre</label>
                                        <select 
                                            value={formData.sexe || ''} 
                                            onChange={(e) => handleChange('sexe', e.target.value)}
                                            className="bg-[#0a0b10] text-white text-lg rounded-xl px-4 py-3 w-full border border-gray-800 outline-none appearance-none"
                                        >
                                            <option value="homme">Homme</option>
                                            <option value="femme">Femme</option>
                                        </select>
                                    </div>
                                    <ModalInput label="Pays" value="France" disabled />
                                </div>
                            </section>

                            <div className="w-full h-px bg-white/5" />

                            {/* Physique & Athlète */}
                            <section className="space-y-4">
                                <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Données Athlète</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <ModalInput label="Taille (cm)" type="number" value={formData.height} onChange={(v: string) => handleChange('height', Number(v))} />
                                    <ModalInput label="Poids (kg)" type="number" value={formData.weight} onChange={(v: string) => handleChange('weight', Number(v))} />
                                </div>
                                <ModalInput label="Date de naissance" type="date" value={formData.date_de_naissance} onChange={(v: string) => handleChange('date_de_naissance', v)} />
                                <ModalInput label="Licence FFA" value={formData.license_number} onChange={(v: string) => handleChange('license_number', v)} />
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-[#12141a]">
                            <button 
                                onClick={handleSubmit} 
                                disabled={isSaving}
                                className="w-full py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                <span>Enregistrer</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// --- WIDGETS GROUPES / COACH (Épurés) ---

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

    if (isLoading) return <Loader2 className="animate-spin text-gray-500 mx-auto"/>;

    if (!userGroup) {
        return (
            <form onSubmit={handleJoin} className="flex gap-2 w-full">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CODE GROUPE" className="bg-[#0a0b10] text-white text-sm rounded-lg px-3 py-2 w-full border border-gray-800 uppercase tracking-widest text-center" />
                <button disabled={isActing} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors">
                    {isActing ? <Loader2 size={16} className="animate-spin"/> : <Users size={16} />}
                </button>
            </form>
        );
    }

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sprint-primary/20 flex items-center justify-center text-sprint-primary font-bold">
                    {userGroup.name.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-white leading-tight">{userGroup.name}</h4>
                    <p className="text-xs text-gray-500">{userGroup.member_count} membres</p>
                </div>
            </div>
            <button onClick={handleLeave} disabled={isActing} className="text-gray-600 hover:text-red-500 transition-colors">
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
        if(!window.confirm("Arrêter le suivi ?")) return;
        setIsActing(true);
        await leaveCoach(personalCoach.id);
        setIsActing(false);
    };

    if (isLoading) return <Loader2 className="animate-spin text-gray-500 mx-auto"/>;

    if (!personalCoach) {
        return (
            <form onSubmit={handleJoin} className="flex gap-2 w-full">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CODE COACH" className="bg-[#0a0b10] text-white text-sm rounded-lg px-3 py-2 w-full border border-gray-800 uppercase tracking-widest text-center" />
                <button disabled={isActing} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors">
                    {isActing ? <Loader2 size={16} className="animate-spin"/> : <User size={16} />}
                </button>
            </form>
        );
    }

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
                <img src={personalCoach.photo_url || ''} alt="Coach" className="w-10 h-10 rounded-full bg-gray-800 object-cover" />
                <div>
                    <h4 className="font-bold text-white leading-tight">{personalCoach.full_name}</h4>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Coach Personnel</span>
                </div>
            </div>
            <button onClick={handleLeave} disabled={isActing} className="text-gray-600 hover:text-red-500 transition-colors">
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
    updateProfile({ ...profile, ...formData });
    toast.success("Profil mis à jour");
    const { error } = await supabase.from('profiles').update(formData).eq('id', profile.id);
    if (error) console.error(error);
  };

  if (!profile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-white" size={32}/></div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24 pb-32">
      
      <EditProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        profile={profile}
        onSave={handleSaveProfile}
      />

      <div className="max-w-lg mx-auto space-y-8">
        
        {/* TITRE SIMPLE */}
        <div>
           <h1 className="text-4xl font-bold tracking-tight mb-1">Profil</h1>
           <p className="text-gray-500 text-sm">Vos informations personnelles</p>
        </div>

        {/* 1. CARTE PRINCIPALE "HERO" (GOWOD Style) */}
        <MinimalCard onClick={() => setIsModalOpen(true)} className="group relative overflow-hidden">
            <div className="flex items-center gap-6">
                {/* Photo Ronde */}
                <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-white/10 bg-gray-800">
                    <img src={profile.photo_url || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                    {/* Nom Entier sans coupure */}
                    <h2 className="text-2xl font-bold text-white leading-tight mb-1 break-words">
                        {profile.first_name} {profile.last_name}
                    </h2>
                    
                    <p className="text-sm text-gray-400 font-mono mb-3">
                        {profile.license_number ? `Licence : ${profile.license_number}` : 'Licence : Non communiqué'}
                    </p>

                    <div className="flex items-center gap-2">
                         <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                            {profile.discipline || 'Sprint'}
                         </span>
                         <span className="text-[10px] text-sprint-primary font-bold uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Modifier <ChevronRight size={10} />
                         </span>
                    </div>
                </div>
            </div>
        </MinimalCard>

        {/* 2. SECTION ÉQUIPE (Minimaliste) */}
        <div className="space-y-4">
            <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest pl-1">Mon Équipe</h3>
            
            <MinimalCard>
                <GroupWidget />
            </MinimalCard>

            <MinimalCard>
                <CoachWidget />
            </MinimalCard>
        </div>

      </div>
    </div>
  );
}