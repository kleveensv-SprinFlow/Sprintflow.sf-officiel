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
  Users,
  LogOut,
  UserPlus,
  Plus,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPOSANTS UI MINIMALISTES ---

interface MinimalCardProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

const MinimalCard = ({ children, onClick, className = "" }: MinimalCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`bg-[#12141a] border border-white/5 rounded-2xl p-6 transition-all ${onClick ? 'cursor-pointer active:scale-[0.99] hover:bg-[#1a1d26]' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

interface ModalInputProps {
    label: string;
    value: string | number | undefined;
    onChange: (value: string) => void;
    type?: string;
    disabled?: boolean;
}

const ModalInput = ({ label, value, onChange, type = "text", disabled = false }: ModalInputProps) => (
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

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile | null;
    onSave: (formData: Partial<Profile>) => Promise<void>;
}

const EditProfileModal = ({ isOpen, onClose, profile, onSave }: EditProfileModalProps) => {
    const [formData, setFormData] = useState<Partial<Profile>>({});
    const [isSaving, setIsSaving] = useState(false);
    
    const isCoach = profile?.role === 'coach';

    useEffect(() => {
        if (profile) setFormData(profile);
    }, [profile, isOpen]);

    const handleChange = (field: keyof Profile, value: string | number) => {
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
                                            <option value="">Sélectionner</option>
                                            <option value="homme">Homme</option>
                                            <option value="femme">Femme</option>
                                        </select>
                                    </div>
                                    <ModalInput label="Pays" value="France" disabled />
                                </div>
                                <ModalInput label="Date de naissance" type="date" value={formData.date_de_naissance} onChange={(v: string) => handleChange('date_de_naissance', v)} />
                            </section>

                            <div className="w-full h-px bg-white/5" />

                            {/* Physique & Athlète (Conditionnel) */}
                            {!isCoach ? (
                                <section className="space-y-4">
                                    <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Données Athlète</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <ModalInput label="Taille (cm)" type="number" value={formData.height} onChange={(v: string) => handleChange('height', Number(v))} />
                                        <ModalInput label="Poids (kg)" type="number" value={formData.weight} onChange={(v: string) => handleChange('weight', Number(v))} />
                                    </div>
                                    <ModalInput label="Licence FFA" value={formData.license_number} onChange={(v: string) => handleChange('license_number', v)} />
                                </section>
                            ) : (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-sm text-gray-400 text-center">
                                        Les données physiques sont réservées aux profils athlètes.
                                    </p>
                                </div>
                            )}
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

// --- WIDGETS GROUPES / COACH (Épurés pour Athlète) ---

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

// --- WIDGETS GESTION ÉQUIPE (Coach) ---

const CoachTeamManagement = () => {
    const { groups, createGroup, loading } = useGroups();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupType, setNewGroupType] = useState<'groupe' | 'athlete'>('groupe');
    const [isCreating, setIsCreating] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName) return;
        setIsCreating(true);
        try {
            await createGroup(newGroupName, newGroupType, null); // max_members null by default
            toast.success(newGroupType === 'groupe' ? 'Groupe créé avec succès' : 'Espace athlète créé avec succès');
            setIsCreateModalOpen(false);
            setNewGroupName('');
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la création');
        } finally {
            setIsCreating(false);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success("Code copié !");
        setTimeout(() => setCopiedCode(null), 3000);
    };

    return (
        <div className="space-y-4">
             {/* MODALE DE CRÉATION */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <>
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={() => setIsCreateModalOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 m-auto w-[90%] max-w-sm h-fit bg-[#12141a] rounded-2xl p-6 border border-white/10 z-50"
                        >
                            <h3 className="text-lg font-bold text-white mb-4">
                                {newGroupType === 'groupe' ? 'Nouveau Groupe' : 'Nouvel Athlète'}
                            </h3>
                            <form onSubmit={handleCreateGroup} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Nom</label>
                                    <input 
                                        autoFocus
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder={newGroupType === 'groupe' ? "Ex: Sprinters Elite" : "Ex: Suivi Thomas"}
                                        className="w-full bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-sprint-primary outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isCreating || !newGroupName}
                                        className="flex-1 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center"
                                    >
                                        {isCreating ? <Loader2 className="animate-spin" size={20}/> : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* LISTE DES GROUPES / CODES */}
            <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest pl-1">Mes Codes d'invitation</h3>
            
            {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-500"/></div>
            ) : (
                <div className="grid gap-3">
                    {groups.map((group) => (
                        <div key={group.id} className="bg-[#1a1d26] rounded-xl p-4 flex items-center justify-between border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${group.type === 'groupe' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>
                                    {group.type === 'groupe' ? <Users size={18} /> : <User size={18} />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">{group.name}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{group.type === 'groupe' ? 'Groupe' : 'Individuel'}</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => copyToClipboard(group.invitation_code)}
                                className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-lg hover:bg-black/60 transition-colors group"
                            >
                                <span className="text-lg font-mono font-bold text-sprint-primary tracking-widest">{group.invitation_code}</span>
                                {copiedCode === group.invitation_code ? <Check size={14} className="text-green-500"/> : <Copy size={14} className="text-gray-500 group-hover:text-white"/>}
                            </button>
                        </div>
                    ))}
                    
                    {groups.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm italic">
                            Aucun groupe ou athlète créé. Commencez par créer un code.
                        </div>
                    )}
                </div>
            )}

            {/* BOUTONS D'ACTION */}
            <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                    onClick={() => { setNewGroupType('groupe'); setIsCreateModalOpen(true); }}
                    className="flex flex-col items-center justify-center gap-2 bg-[#1a1d26] border border-white/5 p-4 rounded-xl hover:bg-[#252a36] transition-all active:scale-95"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Users size={20} />
                    </div>
                    <span className="text-xs font-bold text-white">Créer Groupe</span>
                </button>

                <button 
                    onClick={() => { setNewGroupType('athlete'); setIsCreateModalOpen(true); }}
                    className="flex flex-col items-center justify-center gap-2 bg-[#1a1d26] border border-white/5 p-4 rounded-xl hover:bg-[#252a36] transition-all active:scale-95"
                >
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <UserPlus size={20} />
                    </div>
                    <span className="text-xs font-bold text-white">Code Athlète</span>
                </button>
            </div>
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

  const isCoach = profile.role === 'coach';

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

        {/* 1. CARTE PRINCIPALE "HERO" */}
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
                    
                    {/* Badge/Info conditionnel */}
                    {isCoach ? (
                        <div className="mt-2">
                             <span className="bg-sprint-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-sprint-primary/20">
                                Coach
                             </span>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 mb-3">
                            {profile.license_number ? `Licence : ${profile.license_number}` : 'Licence : Non communiqué'}
                        </p>
                    )}

                    {!isCoach && (
                        <div className="flex items-center gap-2 mt-2">
                             <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                {profile.discipline || 'Sprint'}
                             </span>
                        </div>
                    )}
                    
                    {/* Indicateur d'édition */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] text-sprint-primary font-bold uppercase tracking-wider flex items-center gap-1">
                            Modifier <ChevronRight size={12} />
                         </span>
                    </div>
                </div>
            </div>
        </MinimalCard>

        {/* 2. SECTION ÉQUIPE */}
        {isCoach ? (
            // VUE COACH : GESTION DES GROUPES
            <MinimalCard>
                <CoachTeamManagement />
            </MinimalCard>
        ) : (
            // VUE ATHLÈTE : REJOINDRE DES GROUPES
            <div className="space-y-4">
                <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest pl-1">Mon Équipe</h3>
                
                <MinimalCard>
                    <GroupWidget />
                </MinimalCard>

                <MinimalCard>
                    <CoachWidget />
                </MinimalCard>
            </div>
        )}

      </div>
    </div>
  );
}
