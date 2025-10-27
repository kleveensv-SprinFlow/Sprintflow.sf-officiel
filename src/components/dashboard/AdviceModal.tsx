import React from 'react';
import { X, HeartPulse, Zap, TrendingUp, CheckCircle } from 'lucide-react';

const getThemeConfig = (color: string) => {
  switch (color) {
    case 'text-green-500':
      return { bg: 'bg-green-100 dark:bg-green-900/30', icon: HeartPulse, title: "Analyse de votre Forme" };
    case 'text-blue-500':
      return { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: Zap, title: "Analyse de votre Poids/Puissance" };
    case 'text-purple-500':
      return { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: TrendingUp, title: "Analyse de votre Évolution" };
    default:
      return { bg: 'bg-gray-100 dark:bg-gray-900/30', icon: CheckCircle, title: "Analyse" };
  }
};

const ADVICE_GENERATORS = {
  forme: (data: any) => [
      `Basé sur vos 3 derniers jours d'entraînement (chronos) et la qualité de votre sommeil. Ce score vous indique si vous êtes en état de surcompensation, de fatigue ou de forme optimale.`
    ].filter(Boolean),
  poidsPuissance: (data: any) => [
      `Calculé à partir de votre poids, masse grasse (si disponible) et vos records en musculation. Il estime votre capacité à générer de la force par rapport à votre poids.`
    ].filter(Boolean),
  evolution: (data: any) => [
      `Un score personnalisé qui mesure votre progression dans votre discipline de prédilection (ex: sprint). Il analyse l'évolution de vos chronos et de vos charges en musculation au fil du temps.`
    ].filter(Boolean)
};

const COLOR_MAP = {
    forme: 'text-green-500',
    poidsPuissance: 'text-blue-500',
    evolution: 'text-purple-500'
}

interface AdviceModalProps {
  content: {
    type: 'forme' | 'poidsPuissance' | 'evolution';
    data: any;
  };
  onClose: () => void;
}

const AdviceModal: React.FC<AdviceModalProps> = ({ content, onClose }) => {
  const color = COLOR_MAP[content.type];
  const { bg, icon: Icon, title } = getThemeConfig(color);
  const advices = ADVICE_GENERATORS[content.type](content.data);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full border dark:border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${bg}`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-3">
            {advices.map((advice, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300">{advice}</p>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdviceModal;