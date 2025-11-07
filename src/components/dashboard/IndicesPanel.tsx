import React, { useState, useEffect } from 'react';
import { motion, PanInfo, AnimatePresence, useMotionValue, animate, useTransform } from 'framer-motion';
import { Loader2, Zap, HeartPulse } from 'lucide-react';
import AdviceModal from './AdviceModal.tsx';
import CircularProgress from '../common/CircularProgress.tsx';

interface AnimatedScoreCircleProps {
  score: number | null;
  title: string;
  icon: React.ElementType;
}

const AnimatedScoreCircle: React.FC<AnimatedScoreCircleProps> = ({ score, title, icon: Icon }) => {
  const finalScore = score ?? 0;
  const progressValue = title === "Forme" ? finalScore * 10 : finalScore;

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => (title === "Forme" ? latest.toFixed(1) : Math.round(latest)));

  useEffect(() => {
    const controls = animate(count, finalScore, {
      duration: 1.5,
      delay: 0.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [finalScore, count]);

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <CircularProgress
          value={progressValue}
          strokeWidth={10}
          className="w-full h-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span className="text-4xl font-bold text-gray-800 dark:text-white text-shadow-light dark:text-shadow-dark">
            {rounded}
          </motion.span>
        </div>
      </div>
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
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
  const [activeIndex, setActiveIndex] = useState(0);

  const scores = [
    { type: 'forme' as const, data: scoreForme, title: 'Forme', icon: HeartPulse },
    { type: 'poidsPuissance' as const, data: scorePerformance, title: 'Poids/Puissance', icon: Zap }
  ];

  const handleScoreClick = (type: 'forme' | 'poidsPuissance', data: ScoreData | null) => {
    if (type === 'forme' && data?.indice) {
      onNavigate();
    } else if (data && data.indice !== null) {
      setModalContent({ type, data });
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      setActiveIndex(1);
    } else if (info.offset.x > swipeThreshold) {
      setActiveIndex(0);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-light-glass dark:bg-dark-glass shadow-glass backdrop-blur-lg border border-white/10 rounded-2xl h-[244px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <p className="ml-4 text-lg text-light-label dark:text-dark-label">Calcul des indices...</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!hasCheckedInToday ? (
        <motion.div
          key="locked"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-light-glass dark:bg-dark-glass shadow-glass backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 text-center"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-light-title dark:text-dark-title mb-4">Vos Indices</h2>
          <p className="text-light-label dark:text-dark-label mb-4">Votre indice de forme attend.</p>
          <button onClick={onCheckinClick} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
            Faire mon check-in
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="unlocked"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-light-glass dark:bg-dark-glass shadow-glass backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 overflow-hidden"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-light-title dark:text-dark-title">Vos Indices</h2>
          </div>

          <div className="relative w-full h-[160px]">
            <motion.div
              className="flex absolute inset-0"
              animate={{ x: `-${activeIndex * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            >
              {scores.map((score) => (
                <div
                  key={score.type}
                  className="w-full flex-shrink-0 flex justify-center items-center"
                  onClick={() => handleScoreClick(score.type, score.data)}
                >
                  <AnimatedScoreCircle
                    score={score.data?.indice}
                    title={score.title}
                    icon={score.icon}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center items-center gap-2 mt-2">
            {scores.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  activeIndex === index ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={`Afficher l'indice ${index + 1}`}
              />
            ))}
          </div>

          {modalContent && <AdviceModal content={modalContent} onClose={() => setModalContent(null)} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}