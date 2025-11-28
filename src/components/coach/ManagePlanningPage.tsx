import React, { useState } from 'react';
import { ChevronLeft, Users, User } from 'lucide-react';
import { CoachPlanning } from '../planning/CoachPlanning';
import { AnimatePresence, motion } from 'framer-motion';

interface ManagePlanningPageProps {
  onBack: () => void;
}

type SelectionMode = 'athlete' | 'group';

const ManagePlanningPage: React.FC<ManagePlanningPageProps> = ({ onBack }) => {
  const [selectedMode, setSelectedMode] = useState<SelectionMode | null>(null);

  const handleModeSelect = (mode: SelectionMode) => {
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    setSelectedMode(mode);
  };

  return (
    <AnimatePresence mode="wait">
      {selectedMode ? (
        <motion.div
          key="planning"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <CoachPlanning
            initialSelectionType={selectedMode}
            onBackToSelection={() => setSelectedMode(null)}
          />
        </motion.div>
      ) : (
        <motion.div
          key="selection"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-gray-900 text-white flex flex-col"
        >
          {/* Header */}
          <div className="p-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium"
            >
              <ChevronLeft size={20} /> Retour au Hub
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 gap-8">

            <div className="text-center space-y-2 mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Gestion du Planning
              </h1>
              <p className="text-gray-400 text-lg">
                Sélectionnez votre mode de travail
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {/* Group Card */}
              <button
                onClick={() => handleModeSelect('group')}
                className="group relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/10 hover:border-orange-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm -z-10" />

                <div className="flex flex-col h-full gap-4">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 w-fit rounded-2xl shadow-lg shadow-orange-900/20">
                    <Users size={32} className="text-white" />
                  </div>

                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-white mb-2">Gérer un Groupe</h3>
                    <p className="text-gray-300 font-medium">Planification de masse & macrocycles</p>
                  </div>
                </div>
              </button>

              {/* Athlete Card */}
              <button
                onClick={() => handleModeSelect('athlete')}
                className="group relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/10 hover:border-blue-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm -z-10" />

                <div className="flex flex-col h-full gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 w-fit rounded-2xl shadow-lg shadow-blue-900/20">
                    <User size={32} className="text-white" />
                  </div>

                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-white mb-2">Gérer un Athlète</h3>
                    <p className="text-gray-300 font-medium">Suivi individuel & ajustements précis</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManagePlanningPage;
