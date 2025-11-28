import React, { useState } from 'react';
import { ChevronLeft, Users, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoachPlanning } from '../planning/CoachPlanning';
import { useGroups } from '../../hooks/useGroups';
import { useCoachLinks } from '../../hooks/useCoachLinks';
import useAuth from '../../hooks/useAuth';

interface ManagePlanningPageProps {
  onBack?: () => void;
}

type ViewStep = 'hero' | 'selection_athlete' | 'selection_group' | 'planning';

const ManagePlanningPage: React.FC<ManagePlanningPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<ViewStep>('hero');
  const [selectedContext, setSelectedContext] = useState<{ type: 'athlete' | 'group', id: string } | null>(null);

  const { groups } = useGroups();
  const { linkedAthletes } = useCoachLinks(user?.id);

  const handleHeroSelection = (type: 'athlete' | 'group') => {
    if (type === 'athlete') {
      setStep('selection_athlete');
    } else {
      setStep('selection_group');
    }
  };

  const handleContextSelect = (type: 'athlete' | 'group', id: string) => {
    setSelectedContext({ type, id });
    setStep('planning');
  };

  const handleBack = () => {
    if (step === 'planning') {
      // If we are deep in planning, going back returns to the list of that type
      setStep(selectedContext?.type === 'athlete' ? 'selection_athlete' : 'selection_group');
      setSelectedContext(null);
    } else if (step === 'selection_athlete' || step === 'selection_group') {
      setStep('hero');
    } else if (step === 'hero' && onBack) {
      onBack();
    }
  };

  // --- HERO VIEW ---
  if (step === 'hero') {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center max-w-5xl mx-auto space-y-8">

        <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Pilotage de la Performance
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Choisissez votre cible pour commencer la planification
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full md:h-[500px]">
            {/* ATHLETE CARD (Cold / Blue) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleHeroSelection('athlete')}
              className="relative group overflow-hidden rounded-3xl p-8 flex flex-col justify-between text-left h-64 md:h-full shadow-xl shadow-cyan-900/10 border border-white/10"
            >
              {/* Background with overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 to-slate-900 z-0"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>

              <div className="relative z-20">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4">
                  <User className="text-cyan-400" size={24} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Athlète</h2>
                <p className="text-cyan-200/80 font-medium">Focus individuel & Précision chirurgicale</p>
              </div>

              <div className="relative z-20 flex items-center gap-2 text-white font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <span>Sélectionner</span>
                <ArrowRight size={20} />
              </div>
            </motion.button>

            {/* GROUP CARD (Warm / Orange) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleHeroSelection('group')}
              className="relative group overflow-hidden rounded-3xl p-8 flex flex-col justify-between text-left h-64 md:h-full shadow-xl shadow-orange-900/10 border border-white/10"
            >
              {/* Background with overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-900 to-red-900 z-0"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552674605-469455302558?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>

              <div className="relative z-20">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4">
                  <Users className="text-orange-400" size={24} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Groupe</h2>
                <p className="text-orange-200/80 font-medium">Dynamique de masse & Gestion d'équipe</p>
              </div>

              <div className="relative z-20 flex items-center gap-2 text-white font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <span>Sélectionner</span>
                <ArrowRight size={20} />
              </div>
            </motion.button>
        </div>

        {onBack && (
            <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2">
                <ChevronLeft size={16} /> Retour au tableau de bord
            </button>
        )}
      </div>
    );
  }

  // --- SELECTION VIEW (List) ---
  if (step === 'selection_athlete' || step === 'selection_group') {
    const isAthlete = step === 'selection_athlete';
    const items = isAthlete ? linkedAthletes : groups;
    const title = isAthlete ? "Choisir un Athlète" : "Choisir un Groupe";
    const subTitle = isAthlete ? "Accédez au planning individuel" : "Planifiez pour toute l'équipe";
    const accentColor = isAthlete ? "text-cyan-500" : "text-orange-500";
    const bgHover = isAthlete ? "hover:bg-cyan-50 dark:hover:bg-cyan-900/20" : "hover:bg-orange-50 dark:hover:bg-orange-900/20";

    return (
        <div className="min-h-screen max-w-3xl mx-auto p-4 pt-12">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors mb-8">
                <ChevronLeft size={24} />
                <span className="font-semibold">Retour au choix</span>
            </button>

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                <p className="text-gray-500">{subTitle}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {items.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500">Aucun élément trouvé.</p>
                    </div>
                ) : (
                    items.map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => handleContextSelect(isAthlete ? 'athlete' : 'group', item.id)}
                            className={`w-full text-left p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between group transition-all duration-200 ${bgHover}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isAthlete ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
                                    {isAthlete
                                        ? (item.first_name?.[0] || 'A')
                                        : (item.name?.[0] || 'G')
                                    }
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">
                                        {isAthlete ? `${item.first_name} ${item.last_name}` : item.name}
                                    </h3>
                                    {isAthlete && <p className="text-xs text-gray-400">{item.email}</p>}
                                    {!isAthlete && <p className="text-xs text-gray-400">{item.member_count || 0} membres</p>}
                                </div>
                            </div>
                            <ChevronRight className={`text-gray-300 group-hover:${isAthlete ? 'text-cyan-500' : 'text-orange-500'} transition-colors`} />
                        </button>
                    ))
                )}
            </div>
        </div>
    );
  }

  // --- PLANNING VIEW ---
  // If we have a selection, render the CoachPlanning component
  if (step === 'planning' && selectedContext) {
      return (
        <CoachPlanning
            initialSelection={selectedContext}
            onBack={handleBack}
        />
      );
  }

  return null;
};

// Simple ChevronRight icon for local use if needed, though usually imported
const ChevronRight = ({ className, size=20 }: {className?: string, size?: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);

export default ManagePlanningPage;
