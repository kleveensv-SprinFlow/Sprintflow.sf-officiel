import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, HeartPulse, HelpCircle } from 'lucide-react';
import AdviceModal from './AdviceModal';

interface ScoreCircleProps {
  score: number | null;
  title: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, title, icon: Icon, color, onClick }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className="flex flex-col items-center gap-1.5 sm:gap-2 group transition-transform duration-200 hover:scale-105"
  >
    <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 sm:border-8 bg-gray-50 dark:bg-gray-800 ${color} flex items-center justify-center`}>
      <span className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{score ?? '-'}</span>
    </div>
    <h3 className="text-xs sm:text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
      <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
      {title}
    </h3>
  </button>
);

interface IndicesPanelProps {
  loading: boolean;
  scoreForme: any;
  scorePoidsPuissance: any;
}

export function IndicesPanel({ loading, scoreForme, scorePoidsPuissance }: IndicesPanelProps) {
  const [modalContent, setModalContent] = useState<{ type: 'forme' | 'poidsPuissance'; data: any } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleScoreClick = (type: 'forme' | 'poidsPuissance', data: any) => {
    if (data && data.indice !== null) {
      setModalContent({ type, data });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-lg">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Calcul des indices...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Vos Indices de Performance</h2>
        <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      <div
        className="flex justify-center items-center cursor-pointer h-32"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: '1200px' }}
      >
        <motion.div
          style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(event, info) => {
            if (info.offset.x > 50) {
              setIsFlipped(false);
            } else if (info.offset.x < -50) {
              setIsFlipped(true);
            }
          }}
        >
          <div className="absolute w-full h-full flex justify-center items-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
            <ScoreCircle score={scoreForme?.indice} title="Forme" icon={HeartPulse} color="border-green-400" onClick={() => handleScoreClick('forme', scoreForme)} />
          </div>
          <div className="absolute w-full h-full flex justify-center items-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <ScoreCircle score={scorePoidsPuissance?.indice} title="Poids/Puissance" icon={Zap} color="border-blue-400" onClick={() => handleScoreClick('poidsPuissance', scorePoidsPuissance)} />
          </div>
        </motion.div>
      </div>

      {modalContent && <AdviceModal content={modalContent} onClose={() => setModalContent(null)} />}
    </div>
  );
}