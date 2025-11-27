import React, { useState } from 'react';
import { useGroups } from '../../../hooks/useGroups';
import { Loader2, Users, UserPlus, Check, Copy, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export const CoachTeamManagement = () => {
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
