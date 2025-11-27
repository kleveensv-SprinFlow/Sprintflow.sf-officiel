import React, { useState } from 'react';
import { Profile } from '../../../types';
import { GroupWidget, CoachWidget } from './AthleteWidgets';
import { AthleteEditProfileModal } from './AthleteEditProfileModal';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Minimal Card Reusable
const MinimalCard = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`bg-[#12141a] border border-white/5 rounded-2xl p-6 transition-all ${onClick ? 'cursor-pointer active:scale-[0.99] hover:bg-[#1a1d26]' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

interface AthleteProfileProps {
    profile: Profile;
    onUpdateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const AthleteProfile = ({ profile, onUpdateProfile }: AthleteProfileProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="max-w-lg mx-auto space-y-8">
            <AthleteEditProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profile={profile}
                onSave={onUpdateProfile}
            />

             {/* TITRE SIMPLE */}
            <div>
               <h1 className="text-4xl font-bold tracking-tight mb-1">Profil</h1>
               <p className="text-gray-500 text-sm">Vos informations personnelles</p>
            </div>

            {/* 1. CARTE ATHLÈTE "HERO" */}
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

                        <p className="text-sm text-gray-400 mb-3">
                            {profile.license_number ? `Licence : ${profile.license_number}` : 'Licence : Non communiqué'}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                             <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                {profile.discipline || 'Sprint'}
                             </span>
                        </div>

                        {/* Indicateur d'édition */}
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-[10px] text-sprint-primary font-bold uppercase tracking-wider flex items-center gap-1">
                                Modifier <ChevronRight size={12} />
                             </span>
                        </div>
                    </div>
                </div>
            </MinimalCard>

            {/* 2. SECTION ÉQUIPE (Rejoindre) */}
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
    );
};
