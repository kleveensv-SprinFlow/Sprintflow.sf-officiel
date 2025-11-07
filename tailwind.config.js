/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        'sprintflow-blue': '#00B8FF',
        
        light: {
          background: '#F9F9F9',
          card: '#FFFFFF',
          text: '#333333',
          title: '#111111',
          label: '#666666',
        },
        
        // Dark Mode Palette (MISE À JOUR)
        dark: {
          background: '#0F172A', // Fond bleu nuit
          card: '#334155',       // Carte nettement plus claire pour un contraste évident
          text: '#F1F5F9',
          title: '#F1F5F9',
          label: '#F1F5F9',
        },
      },
      
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      
      fontSize: {
        'micro': ['12px', '16px'],
        'label': ['14px', '20px'],
        'base': ['16px', '24px'],
        'h3': ['22px', '28px'],
        'h2': ['28px', '36px'],
        'h1': ['36px', '44px'],
      },
      
      boxShadow: {
        'card-light': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)', // Ombre bien prononcée
        'button-glow': '0 0 12px 0 #00B8FF',
      },

      keyframes: {
        'fadeIn-slideUp': { 'from': { opacity: '0', transform: 'translateY(5px)' }, 'to': { opacity: '1', transform: 'translateY(0)' } },
        'pop-in': { '0%': { opacity: '0', transform: 'scale(0.95)' }, '80%': { opacity: '1', transform: 'scale(1.02)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        'fade-in-slide-up': 'fadeIn-slideUp 300ms ease-out forwards',
        'pop-in': 'pop-in 200ms ease-out forwards',
      },
    },
  },
  plugins: [],
};
2. Fichier src/components/dashboard/IndicesPanel.tsx (Code corrigé)
Ici, j'ai remplacé la classe card-glass et les couleurs fixes par les classes de notre thème.

import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Loader2, Zap, HeartPulse } from 'lucide-react';
import AdviceModal from './AdviceModal';
import CircularProgress from '../common/CircularProgress';

interface ScoreCircleProps {
  score: number | null;
  title: string;
  icon: React.ElementType;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, title, icon: Icon }) => {
  const progressValue = score !== null ? (title === "Forme" ? score * 10 : score) : 0;

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <CircularProgress 
          value={progressValue} 
          strokeWidth={10}
          className="w-full h-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-light-title dark:text-dark-title">{score ?? '-'}</span>
        </div>
      </div>
      <h3 className="text-base font-bold text-light-text dark:text-dark-text flex items-center gap-1.5">
        <Icon className="w-4 h-4 text-light-label dark:text-dark-label" />
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
}

export function IndicesPanel({ loading, scoreForme, scorePerformance, onNavigate }: IndicesPanelProps) {
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
      <div className="bg-light-card dark:bg-dark-card shadow-card-light dark:shadow-card-dark rounded-lg flex justify-center items-center p-8 h-[244px]">
        <Loader2 className="w-8 h-8 animate-spin text-sprintflow-blue" />
        <p className="ml-4 text-lg text-light-text dark:text-dark-text">Calcul des indices...</p>
      </div>
    );
  }

  return (
    <div className="bg-light-card dark:bg-dark-card shadow-card-light dark:shadow-card-dark rounded-lg p-4 sm:p-6 overflow-hidden">
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
              <ScoreCircle
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
              activeIndex === index ? 'bg-sprintflow-blue' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
            }`}
            aria-label={`Afficher l'indice ${index + 1}`}
          />
        ))}
      </div>
      
      {modalContent && <AdviceModal content={modalContent} onClose={() => setModalContent(null)} />}
    </div>
  );
}