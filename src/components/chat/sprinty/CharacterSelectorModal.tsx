import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { useSprinty } from '../../../context/SprintyContext';

// Define the characters data
const CHARACTERS = [
  {
    id: 'kalo',
    name: 'KALO',
    role: 'Nutritionniste',
    animal: 'Panda',
    color: '#22c55e', // Green-500
    gradient: 'from-green-400 to-green-600',
    shadowColor: 'rgba(34, 197, 94, 0.5)',
  },
  {
    id: 'zoom',
    name: 'ZOOM',
    role: 'Analyste Technique',
    animal: 'Aigle',
    color: '#06b6d4', // Cyan-500
    gradient: 'from-cyan-400 to-blue-600',
    shadowColor: 'rgba(6, 182, 212, 0.5)',
  },
  {
    id: 'mentor',
    name: 'MENTOR',
    role: 'Préparateur Mental',
    animal: 'Hibou',
    color: '#8b5cf6', // Violet-500
    gradient: 'from-violet-400 to-indigo-600',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
  },
  {
    id: 'snooze',
    name: 'SNOOZE',
    role: 'Expert Récupération',
    animal: 'Koala', // Assumed based on name
    color: '#a5b4fc', // Indigo-300 (Lavender-ish)
    gradient: 'from-indigo-300 to-blue-400',
    shadowColor: 'rgba(165, 180, 252, 0.5)',
  },
  {
    id: 'statix',
    name: 'STATIX',
    role: 'Data Scientist',
    animal: 'Renard',
    color: '#f97316', // Orange-500
    gradient: 'from-orange-400 to-red-500',
    shadowColor: 'rgba(249, 115, 22, 0.5)',
  },
];

const CharacterSelectorModal: React.FC = () => {
  const { isCharacterSelectorOpen, setCharacterSelectorOpen } = useSprinty();

  if (!isCharacterSelectorOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-xl"
        onClick={() => setCharacterSelectorOpen(false)}
      >
        {/* Close Button */}
        <button
          onClick={() => setCharacterSelectorOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X size={24} />
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md space-y-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white animate-text-shine-electric">
              L'équipe SprintFlow
            </h2>
            <p className="text-gray-300 text-sm">
              Sélectionnez un expert pour vous accompagner.
            </p>
          </div>

          <div className="grid gap-4">
            {CHARACTERS.map((char, index) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300"
              >
                {/* Glow Background Effect */}
                <div 
                  className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${char.gradient}`}
                />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar Circle with Glow */}
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg border border-white/20"
                      style={{ 
                        background: `linear-gradient(135deg, ${char.color}, #1f2937)`,
                        boxShadow: `0 0 15px ${char.shadowColor}`
                      }}
                    >
                      <span className="text-lg font-bold text-white">
                        {char.name[0]}
                      </span>
                    </div>

                    <div className="text-left">
                      <h3 className="font-bold text-white text-lg tracking-wide">
                        {char.name}
                      </h3>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                        {char.role}
                      </p>
                    </div>
                  </div>

                  {/* Locked Icon */}
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/5">
                    <Lock size={14} className="text-gray-500" />
                    <span className="text-[10px] font-semibold text-gray-500">BIENTÔT</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-white/40 mt-8">
            Ces agents sont en cours d'entraînement...
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CharacterSelectorModal;
