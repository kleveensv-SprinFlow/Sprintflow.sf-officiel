import React from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

interface StepCycleProps {
  menstruations: boolean;
  setMenstruations: (val: boolean) => void;
}

export const StepCycle: React.FC<StepCycleProps> = ({ menstruations, setMenstruations }) => {
  return (
    <div className="py-8 px-4 flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold dark:text-white">Cycle Menstruel</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          Avez-vous vos règles aujourd'hui ? Cette information aide à adapter l'intensité de l'entraînement.
        </p>
      </div>

      <motion.button
        onClick={() => setMenstruations(!menstruations)}
        className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 border-4 transition-colors duration-300 shadow-lg ${
          menstruations 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-500' 
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
        }`}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: menstruations ? 1.1 : 1,
          borderColor: menstruations ? '#ef4444' : '#e5e7eb'
        }}
      >
        <Droplets size={40} className={menstruations ? 'fill-current' : ''} />
        <span className="font-bold">{menstruations ? 'OUI' : 'NON'}</span>
        
        {menstruations && (
          <motion.div
            layoutId="active-ring"
            className="absolute inset-0 rounded-full border-4 border-red-500 opacity-50"
            initial={{ scale: 1 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.button>
    </div>
  );
};