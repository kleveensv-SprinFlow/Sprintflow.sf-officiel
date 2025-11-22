import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Users, User, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import SprintyAvatar from '../chat/sprinty/SprintyAvatar';
import { useSprinty } from '../../context/SprintyContext';

interface SprintyWizardProps {
  onCreate: (name: string, type: 'groupe' | 'athlete', maxMembers: number | null, color: string) => Promise<void>;
}

// Neon/Premium Color Palette
const PREMIUM_COLORS = [
  { hex: '#3B82F6', name: 'Electric Blue' },
  { hex: '#8B5CF6', name: 'Purple Power' },
  { hex: '#EC4899', name: 'Hot Pink' },
  { hex: '#EF4444', name: 'Red Alert' },
  { hex: '#F59E0B', name: 'Amber Energy' },
  { hex: '#10B981', name: 'Emerald Speed' },
  { hex: '#06B6D4', name: 'Cyan Future' },
  { hex: '#F97316', name: 'Orange Crush' },
];

export const SprintyWizard: React.FC<SprintyWizardProps> = ({ onCreate }) => {
  const { setExpression } = useSprinty();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [groupType, setGroupType] = useState<'groupe' | 'athlete' | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PREMIUM_COLORS[0].hex);
  const [isCreating, setIsCreating] = useState(false);
  
  // Manage Sprinty's Expression based on step
  useEffect(() => {
    switch (step) {
      case 1:
        setExpression('happy');
        break;
      case 2:
        setExpression('thinking');
        break;
      case 3:
        setExpression('typing'); // or 'neutral'
        break;
      case 4:
        setExpression('success'); // or 'happy'
        break;
    }
  }, [step, setExpression]);
  
  const handleNextStep = () => {
    if (step === 1) setStep(2);
  };

  const handleTypeSelect = (type: 'groupe' | 'athlete') => {
    setGroupType(type);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      const maxMembers = groupType === 'athlete' ? 1 : null;
      await onCreate(name, groupType!, maxMembers, color);
      setStep(4);
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
      </div>

      {/* Sprinty Avatar Container (Interactive) */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-12 md:top-20 left-1/2 transform -translate-x-1/2 w-32 h-32 md:w-48 md:h-48 z-20"
      >
         <SprintyAvatar scale={1} className="w-full h-full" />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-2xl px-6 mt-32 md:mt-40">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl relative">
                 {/* Speech Bubble Tail */}
                 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-white/10"></div>
                 
                 <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
                  Salut Coach ! 👋
                 </h1>
                 <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                   Je suis Sprinty, ton assistant personnel.<br/>
                   Prêt à lancer ta toute première Team et propulser tes athlètes ?
                 </p>
              </div>

              <button
                onClick={handleNextStep}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-primary-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 hover:bg-primary-500 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]"
              >
                C'est parti !
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Quel type de suivi veux-tu créer ?</h2>
                <p className="text-gray-400">Choisis l'option qui correspond le mieux à tes besoins actuels.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => handleTypeSelect('groupe')}
                  className="group relative p-6 h-64 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 hover:scale-105 hover:shadow-xl"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Groupe d'Athlètes</h3>
                    <p className="text-sm text-gray-400">Idéal pour les clubs, les équipes ou les classes. Suis plusieurs athlètes en même temps.</p>
                  </div>
                </button>

                <button
                  onClick={() => handleTypeSelect('athlete')}
                  className="group relative p-6 h-64 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 hover:scale-105 hover:shadow-xl"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/40 transition-colors">
                    <User className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Suivi Individuel</h3>
                    <p className="text-sm text-gray-400">Parfait pour un coaching personnalisé 1-to-1. Focus total sur un seul athlète.</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-center text-white mb-6">
                {groupType === 'groupe' ? 'Nomme ta Team' : 'Nom de l\'athlète'}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={groupType === 'groupe' ? "Ex: Team Élite 2024" : "Ex: Usain Bolt"}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Couleur du thème</label>
                  <div className="grid grid-cols-4 gap-3">
                    {PREMIUM_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setColor(c.hex)}
                        className={`w-full aspect-square rounded-lg border-2 transition-all duration-200 ${
                          color === c.hex 
                            ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                            : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!name.trim() || isCreating}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isCreating ? <Loader2 className="animate-spin" /> : <Check />}
                  <span>Créer le {groupType === 'groupe' ? 'Groupe' : 'Suivi'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <Check className="w-12 h-12 text-white" strokeWidth={4} />
              </div>
              
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">Félicitations ! 🎉</h2>
                <p className="text-xl text-gray-300">
                  Ton premier espace de travail est prêt.
                </p>
                <p className="text-gray-400 mt-2">
                   Retrouve le code d'invitation dans les détails du groupe pour inviter tes athlètes.
                </p>
              </div>

              <button
                onClick={() => window.location.reload()} // Simple reload to refresh state and show the dashboard
                className="inline-block px-8 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-xl"
              >
                Accéder au Tableau de Bord
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
