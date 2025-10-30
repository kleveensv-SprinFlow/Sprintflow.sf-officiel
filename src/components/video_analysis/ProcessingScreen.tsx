import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProcessingScreenProps {
  progress: number;
}

export function ProcessingScreen({ progress }: ProcessingScreenProps) {
  const getStatusText = (prog: number) => {
    if (prog < 25) return "T�l�chargement de la vid�o...";
    if (prog < 75) return "D�tection des articulations...";
    if (prog < 100) return "Analyse du mouvement...";
    return "Finalisation du rapport...";
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center text-center h-full">
        <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
        <h2 className="text-2xl font-semibold mt-6">Analyse en cours...</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
            {getStatusText(progress)}
        </p>

        <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div
                className="bg-blue-600 h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>
        <p className="text-lg font-semibold mt-4">{progress}%</p>
    </div>
  );
}
