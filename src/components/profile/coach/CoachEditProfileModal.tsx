import React, { useState, useEffect } from 'react';
import { Profile } from '../../../types';
import { Loader2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface CoachEditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile | null;
    onSave: (formData: Partial<Profile>) => Promise<void>;
}

export const CoachEditProfileModal = ({ isOpen, onClose, profile, onSave }: CoachEditProfileModalProps) => {
    const [formData, setFormData] = useState<Partial<Profile>>({});
    const [isSaving, setIsSaving] = useState(false);
    
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
                            <h2 className="text-xl font-bold text-white">Éditer le profil (Coach)</h2>
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
                            
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-sm text-gray-400 text-center">
                                    Les données physiques sont réservées aux profils athlètes.
                                </p>
                            </div>
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
