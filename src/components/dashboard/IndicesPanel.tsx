import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, animate, useTransform } from 'framer-motion';
import { Loader2, Zap, HeartPulse } from 'lucide-react';
import AdviceModal from './AdviceModal.tsx';
import CircularProgress from '../common/CircularProgress.tsx';

interface AnimatedScoreCircleProps {
  score: number | null;
  title: string;
  icon: React.ElementType;
  isClickable?: boolean;
  hasButton?: boolean;
  onButtonClick?: () => void;
  buttonText?: string;
  size?: string;
}

const AnimatedScoreCircle: React.FC<AnimatedScoreCircleProps> = ({
  score,
  title,
  icon: Icon,
  isClickable = true,
  hasButton = false,
  onButtonClick,
  buttonText,
  size = 'w-32 h-32',
}) => {
  const containerClasses = `flex flex-col items-center gap-2 group ${!isClickable ? 'opacity-60' : ''}`;

  if (hasButton) {
    return (
      <div className={containerClasses}>
        <div className={`relative ${size} flex items-center justify-center grayscale`}>
          <CircularProgress value={0} strokeWidth={8} className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onButtonClick) onButtonClick();
              }}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors duration-300 text-center"
            >
              {buttonText}
            </button>
          </div>
        </div>
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          {title}
        </h3>
      </div>
    );
  }

  if (score === null) {
    return (
      <div className={containerClasses}>
        <div className={`relative ${size} flex items-center justify-center grayscale`}>
          <CircularProgress value={0} strokeWidth={8} className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-500 dark:text-gray-400">--</span>
          </div>
        </div>
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          {title}
        </h3>
      </div>
    );
  }

  const finalScore = score ?? 0;
  const progressValue = title === "Forme" ? finalScore * 10 : finalScore;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => (title === "Forme" ? latest.toFixed(1) : Math.round(latest)));

  useEffect(() => {
    const controls = animate(count, finalScore, { duration: 1.5, delay: 0.5, ease: "easeOut" });
    return controls.stop;
  }, [finalScore, count]);

  return (
    <div className={containerClasses}>
      <div className={`relative ${size} flex items-center justify-center`}>
        <CircularProgress value={progressValue} strokeWidth={8} className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span className="text-3xl font-bold text-gray-800 dark:text-white text-shadow-light dark:text-shadow-dark">
            {rounded}
          </motion.span>
        </div>
      </div>
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        {title}
      </h3>
    </div>
  );
};


interface ScoreData {
  indice: number | null;
}

interface IndicesPanelProps {
  loading: boolean;
  scoreForme: ScoreData | null;
  scorePerformance: ScoreData | null;
  onNavigate: () => void;
  hasCheckedInToday: boolean;
  onCheckinClick: () => void;
}

export function IndicesPanel({ loading, scoreForme, scorePerformance, onNavigate, hasCheckedInToday, onCheckinClick }: IndicesPanelProps) {
  const [modalContent, setModalContent] = useState<{ type: 'forme' | 'poidsPuissance'; data: ScoreData } | null>(null);

  const handleScoreClick = (type: 'forme' | 'poidsPuissance', data: ScoreData | null) => {
    if (type === 'forme') {
      if (hasCheckedInToday && data?.indice) {
        onNavigate();
      } else if (!hasCheckedInToday) {
        onCheckinClick();
      }
    } else if (data && data.indice !== null) {
      setModalContent({ type, data });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-light-glass dark:bg-dark-glass shadow-glass backdrop-blur-lg border border-white/10 rounded-2xl h-[220px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <p className="ml-4 text-lg text-light-label dark:text-dark-label">Calcul des indices...</p>
      </div>
    );
  }

  return (
    <motion.div
      key="unlocked"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-light-glass dark:bg-dark-glass shadow-glass backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-light-title dark:text-dark-title">Vos Indices</h2>
      </div>

      <div className="flex justify-around items-center w-full h-[140px]">
        <div
          className="w-1/2 flex justify-center items-center cursor-pointer"
          onClick={() => handleScoreClick('forme', scoreForme)}
        >
          <AnimatedScoreCircle
            score={scoreForme?.indice ?? null}
            title="Forme"
            icon={HeartPulse}
            hasButton={!hasCheckedInToday}
            onButtonClick={onCheckinClick}
            buttonText="Faire mon check-in"
            isClickable={hasCheckedInToday}
            size="w-28 h-28"
          />
        </div>
        <div
          className="w-1/2 flex justify-center items-center cursor-pointer"
          onClick={() => handleScoreClick('poidsPuissance', scorePerformance)}
        >
          <AnimatedScoreCircle
            score={scorePerformance?.indice ?? null}
            title="Poids/Puissance"
            icon={Zap}
            isClickable={scorePerformance?.indice !== null}
            size="w-28 h-28"
          />
        </div>
      </div>

      {modalContent && <AdviceModal content={modalContent} onClose={() => setModalContent(null)} />}
    </motion.div>
  );
}
