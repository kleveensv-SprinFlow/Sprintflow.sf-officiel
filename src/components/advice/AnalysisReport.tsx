import React from 'react';
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalysisReportProps {
  result: any; // Le résultat de l'analyse, ex: { depth: { achieved: true }, backPosture: { achieved: false, message: '...' } }
  onReset: () => void;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ result, onReset }) => {
  if (!result) {
    return (
      <div className="text-center p-8 bg-red-100 dark:bg-red-900/30 rounded-lg">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="mt-4 text-xl font-semibold">Erreur d'Analyse</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Nous n'avons pas pu générer le rapport. Veuillez réessayer.
        </p>
      </div>
    );
  }

  const checks = [
    { id: 'depth', label: 'Profondeur du Squat', ...result.depth },
    { id: 'backPosture', label: 'Posture du Dos', ...result.backPosture },
  ];

  const score = checks.reduce((acc, check) => acc + (check.achieved ? 1 : 0), 0);
  const total = checks.length;
  const percentage = (score / total) * 100;
  
  const getScoreColor = () => {
    if (percentage > 80) return 'text-green-500';
    if (percentage > 50) return 'text-yellow-500';
    return 'text-red-500';
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Rapport d'Analyse
        </h2>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg text-center">
        <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-300">Score de Technique</h3>
        <p className={`font-bold text-5xl ${getScoreColor()}`}>
          {Math.round(percentage)}%
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {score} / {total} points clés validés
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Détails de l'analyse</h3>
        {checks.map(check => (
           <ChecklistItem
              key={check.id}
              label={check.label}
              achieved={check.achieved}
              message={check.message}
            />
        ))}
      </div>
      
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-transform duration-200 hover:scale-105"
      >
        <RefreshCw className="w-5 h-5" />
        Analyser une nouvelle vidéo
      </button>
    </motion.div>
  );
};

interface ChecklistItemProps {
  label: string;
  achieved: boolean;
  message: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ label, achieved, message }) => (
  <motion.div 
    className="flex items-start p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
  >
    {achieved ? (
      <CheckCircle2 className="w-7 h-7 text-green-500 mr-4 flex-shrink-0" />
    ) : (
      <XCircle className="w-7 h-7 text-red-500 mr-4 flex-shrink-0" />
    )}
    <div>
      <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </motion.div>
);

export default AnalysisReport;
