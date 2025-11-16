import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, animate, useTransform, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, HeartPulse, Lock, ArrowUp } from 'lucide-react';
import AdviceModal from './AdviceModal.tsx';
import CircularProgress from '../common/CircularProgress.tsx';
import UpdateBodyFatModal from './UpdateBodyFatModal.tsx';
import { useBodycomp } from '../../hooks/useBodycomp.ts';
import { MicroChart } from '../common/MicroChart.tsx';

const ACCENT_COLOR_CLASS = 'text-violet-500';

interface AnimatedScoreCircleProps {
  score: number | null;
  title: React.ReactNode;
  icon: React.ElementType;
  progress?: number;
  isForme?: boolean;
  isCelebration?: boolean;
  isClickable?: boolean;
  hasButton?: boolean;
  onButtonClick?: () => void;
  buttonText?: string;
  size?: string;
  trendData?: number[];
}

const AnimatedScoreCircle: React.FC<AnimatedScoreCircleProps> = ({
  score,
  title,
  icon: Icon,
  progress,
  isForme = false,
  isCelebration = false,
  isClickable = true,
  hasButton = false,
  onButtonClick,
  buttonText,
  size = 'w-32 h-32',
  trendData = [],
}) => {
  const containerClasses = `flex flex-col items-center gap-2 group ${!isClickable ? 'opacity-60' : ''}`;

  if (hasButton) {
    return (
      <div className={containerClasses}>
        <div className={`relative ${size} flex items-center justify-center grayscale`}>
          <CircularProgress value={0} strokeWidth={8} className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <button
              onClick={(e) => { e.stopPropagation(); if (onButtonClick) onButtonClick(); }}
              className={`bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors duration-300 text-center shadow-md shadow-violet-500/30`}
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
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, finalScore, {
      duration: isCelebration ? 0.5 : 1.5,
      ease: "easeOut",
      delay: isCelebration ? 0.2 : 0.5,
    });
    return controls.stop;
  }, [finalScore, count, isCelebration]);

  const scoreColor = isForme
    ? finalScore >= 80 ? 'text-green-500' : finalScore >= 50 ? 'text-amber-500' : 'text-red-500'
    : ACCENT_COLOR_CLASS;

  return (
    <div className={containerClasses}>
      <div className={`relative ${size} flex items-center justify-center`}>
        <CircularProgress value={finalScore} strokeWidth={8} className="w-full h-full" glow={isCelebration} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <motion.span className={`text-4xl font-bold ${scoreColor} text-shadow-light dark:text-shadow-dark`}>
              {rounded}
            </motion.span>
            {progress && progress > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className={`ml-1 flex items-center font-bold ${ACCENT_COLOR_CLASS}`}
              >
                <ArrowUp className="w-3 h-3" />
                <span>{progress}</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        {title}
      </h3>
      <div className="h-4 w-16 mt-1">
        {trendData && trendData.length > 1 && <MicroChart data={trendData} isForme={isForme} />}
      </div>
    </div>
  );
};

interface ScoreData {
  indice: number | null;
  history?: number[];
}

interface PerformanceScoreData {
  score: number | null;
  history?: number[];
  progress?: number;
  details: { 
    composition: {
      mode: 'expert' | 'standard' | 'default';
    };
    force: {
      score_explosivite: number;
      score_force_maximale: number;
    };
  };
}
interface IndicesPanelProps {
  loading: boolean;
  scoreForme: ScoreData | null;
  scorePerformance: PerformanceScoreData | null;
  onNavigate: () => void;
  hasCheckedInToday: boolean;
  onCheckinClick: () => void;
  onOnboardingComplete: () => void;
  onUnlockPerformanceClick: () => void;
}


export function IndicesPanel({ loading, scoreForme, scorePerformance, onNavigate, hasCheckedInToday, onCheckinClick, onOnboardingComplete, onUnlockPerformanceClick }: IndicesPanelProps) {
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [justUnlockedPerformance, setJustUnlockedPerformance] = useState(false);

  useEffect(() => {
    if (hasCheckedInToday) {
      setJustCheckedIn(true);
      const timer = setTimeout(() => setJustCheckedIn(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCheckedInToday]);

  useEffect(() => {
    if (scorePerformance?.score !== null) {
      setJustUnlockedPerformance(true);
      const timer = setTimeout(() => setJustUnlockedPerformance(false), 2000); // Animation dure 2s
      return () => clearTimeout(timer);
    }
  }, [scorePerformance]);

  if (loading) {
     return (
      <div className="flex justify-center items-center p-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl h-[240px] shadow-lg">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <p className="ml-4 text-lg text-white/80">Calcul des indices...</p>
      </div>
    );
  }

  return (
    <motion.div
      key="unlocked"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Vos Indices</h2>
      </div>

      <div className="flex justify-around items-start w-full h-[160px]">
        <div
          className="w-1/2 flex justify-center items-center cursor-pointer"
          onClick={() => {
            if (hasCheckedInToday && scoreForme?.indice) onNavigate();
            else if (!hasCheckedInToday) onCheckinClick();
          }}
        >
          <AnimatedScoreCircle
            score={scoreForme?.indice ?? null}
            title="Forme"
            icon={HeartPulse}
            isForme={true}
            isCelebration={justCheckedIn}
            hasButton={!hasCheckedInToday}
            onButtonClick={onCheckinClick}
            buttonText="Faire mon check-in"
            isClickable={hasCheckedInToday}
            size="w-28 h-28"
            trendData={scoreForme?.history}
          />
        </div>

        <div className="w-1/2 flex justify-center items-center">
          <AnimatePresence mode="wait">
            {!scorePerformance?.score && !loading ? (
              <motion.div
                key="locked"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center p-4 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors"
                onClick={onUnlockPerformanceClick}
              >
                <div className="p-3 bg-violet-500/20 rounded-full mb-2">
                  <Lock className="w-6 h-6 text-violet-500" />
                </div>
                <h3 className="font-bold text-white">Débloquer l'Indice</h3>
                <p className="text-xs text-white/60">Entrez vos 1ères données</p>
              </motion.div>
            ) : (
              <motion.div
                key="unlocked-performance"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="cursor-pointer"
              >
                <AnimatedScoreCircle
                  score={scorePerformance?.score ?? null}
                  title="Poids/Puissance"
                  icon={Zap}
                  progress={scorePerformance?.progress}
                  isCelebration={justUnlockedPerformance}
                  isClickable={scorePerformance?.score !== null}
                  size="w-28 h-28"
                  trendData={scorePerformance?.history}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
