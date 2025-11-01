// src/components/dashboard/AthleteMarquee.tsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Zap, Calendar, Loader } from 'lucide-react';
import { useRecords } from '../../hooks/useRecords';
import { useBodycomp } from '../../hooks/useBodycomp';
import { Profile } from '../../types';

// --- MOCKED DATA FOR PREVIEW ---
const MOCKED_ATHLETES: Athlete[] = [
  { id: '1', first_name: 'Alex', last_name: 'Martin', avatar_url: 'https://i.pravatar.cc/150?img=1', date_of_birth: '1998-05-20', discipline: '100m' },
  { id: '2', first_name: 'Léa', last_name: 'Dubois', avatar_url: 'https://i.pravatar.cc/150?img=2', date_of_birth: '2000-11-12', discipline: 'Saut en longueur' },
  { id: '3', first_name: 'Lucas', last_name: 'Garcia', avatar_url: 'https://i.pravatar.cc/150?img=3', date_of_birth: '1999-02-03', discipline: 'Lancer de poids' },
  { id: '4', first_name: 'Chloé', last_name: 'Bernard', avatar_url: 'https://i.pravatar.cc/150?img=4', date_of_birth: '2001-08-25', discipline: '400m haies' },
  { id: '5', first_name: 'Enzo', last_name: 'Petit', avatar_url: 'https://i.pravatar.cc/150?img=5', date_of_birth: '2002-01-30', discipline: 'Triple saut' },
];
// --- END MOCKED DATA ---


interface Athlete extends Profile {
  first_name: string;
  last_name: string;
  avatar_url?: string;
  date_of_birth?: string;
  discipline?: string;
}

export interface AthleteMarqueeProps {
  athletes?: Athlete[];
  onAthleteClick: (athleteId: string) => void;
  isPreview?: boolean;
}

const calculateAge = (dob: string | undefined): number | string => {
  if (!dob) return 'N/A';
  try {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  } catch (e) {
    return 'N/A';
  }
};

const AthleteCard: React.FC<{ 
  athlete: Athlete; 
  powerToWeightRatio: string | number;
  onClick: () => void 
}> = ({ athlete, powerToWeightRatio, onClick }) => {
  const fullName = `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim();
  const age = calculateAge(athlete.date_of_birth);

  return (
    <div
      onClick={onClick}
      className="relative w-[45vw] md:w-48 h-64 shrink-0 cursor-pointer rounded-2xl overflow-hidden p-4 flex flex-col justify-end bg-black/20 backdrop-blur-lg border border-white/20 shadow-lg group"
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${athlete.avatar_url || '/default-avatar.png'})` }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="relative z-10 text-white">
        <h3 className="font-bold text-lg text-shadow-dark truncate">{fullName}</h3>
        <div className="text-sm space-y-1 mt-1 text-gray-200">
          <p className="flex items-center gap-2"><Calendar size={14} /> {age} ans</p>
          <p className="flex items-center gap-2 capitalize truncate"><User size={14} /> {athlete.discipline || 'N/A'}</p>
          <p className="flex items-center gap-2 font-semibold"><Zap size={14} /> {powerToWeightRatio}x PdC</p>
        </div>
      </div>
    </div>
  );
};

const AthleteCardWithData: React.FC<{ athlete: Athlete; onAthleteClick: (athleteId: string) => void, isPreview?: boolean }> = ({ athlete, onAthleteClick, isPreview }) => {
  if (isPreview) {
    return <AthleteCard athlete={athlete} powerToWeightRatio={(Math.random() * (3 - 1.5) + 1.5).toFixed(2)} onClick={() => onAthleteClick(athlete.id)} />;
  }
  
  const { records, loading: recordsLoading } = useRecords(athlete.id);
  const { lastWeight, loading: weightLoading } = useBodycomp(athlete.id);

  const powerToWeightRatio = useMemo(() => {
    if (!records || !lastWeight?.weight) return 'N/A';
    const strengthRecords = records.filter(r => r.type === 'exercise' && r.value > 0);
    if (strengthRecords.length === 0) return 'N/A';
    const bestRecord = strengthRecords.reduce((best, current) => current.value > best.value ? current : best);
    return (bestRecord.value / lastWeight.weight).toFixed(2);
  }, [records, lastWeight]);
  
  if (recordsLoading || weightLoading) {
    return (
      <div className="w-[45vw] md:w-48 h-64 shrink-0 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <Loader className="animate-spin text-gray-500" />
      </div>
    );
  }

  return <AthleteCard athlete={athlete} powerToWeightRatio={powerToWeightRatio} onClick={() => onAthleteClick(athlete.id)} />;
};

const CAROUSEL_THRESHOLD = 3;

export const AthleteMarquee: React.FC<AthleteMarqueeProps> = ({ athletes = [], onAthleteClick, isPreview = false }) => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const data = isPreview ? MOCKED_ATHLETES : athletes;

  const shuffledAthletes = useMemo(() => [...data].sort(() => Math.random() - 0.5), [data]);
  
  const isCarousel = shuffledAthletes.length >= CAROUSEL_THRESHOLD;
  const duplicatedAthletes = isCarousel ? [...shuffledAthletes, ...shuffledAthletes] : shuffledAthletes;
  
  // Correction de la fuite mémoire: gestion du timeout dans un useEffect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (isPaused) {
      timeoutId = setTimeout(() => setIsPaused(false), 4000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPaused]);

  if (!isPreview && (!data || data.length === 0)) {
    return (
      <div className="py-8" data-testid="empty-marquee">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 px-4 sm:px-6 text-shadow-light dark:text-shadow-dark">À la une</h2>
        <div className="px-4 sm:px-6">
          <div className="relative w-full md:w-auto md:max-w-md h-64 rounded-2xl p-6 flex flex-col justify-center items-center bg-black/20 backdrop-blur-lg border border-white/20 shadow-lg text-center">
            <User size={48} className="text-white/50 mb-4" />
            <h3 className="font-bold text-lg text-white text-shadow-dark">Aucun athlète à afficher</h3>
            <p className="text-sm text-gray-300 mt-2">Invitez des athlètes dans vos groupes pour les voir apparaître ici.</p>
          </div>
        </div>
      </div>
    );
  }
  
  const cardWidth = window.innerWidth * 0.45 + 16; // 45vw + 1rem gap
  const marqueeWidth = cardWidth * shuffledAthletes.length;
  
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 px-4 sm:px-6 text-shadow-light dark:text-shadow-dark">À la une</h2>
      <div
        className="relative w-full overflow-x-auto no-scrollbar"
        onMouseEnter={() => isCarousel && setIsPaused(true)}
        onMouseLeave={() => isCarousel && setIsPaused(false)}
        onTouchStart={() => isCarousel && setIsPaused(true)}
        onTouchEnd={() => isCarousel && setIsPaused(false)}
      >
        <motion.div
          ref={marqueeRef}
          className="flex gap-4 px-4 sm:px-6"
          style={{ justifyContent: isCarousel ? 'flex-start' : 'center' }}
          animate={{
            x: isCarousel ? [0, -marqueeWidth] : 0,
          }}
          transition={{
            ease: 'linear',
            duration: shuffledAthletes.length * 6, // 6s per card for a slower scroll
            repeat: Infinity,
          }}
          variants={{
            paused: { animationPlayState: 'paused' },
            running: { animationPlayState: 'running' },
          }}
          initial="running"
          animate={isPaused || !isCarousel ? 'paused' : 'running'}
        >
            {duplicatedAthletes.map((athlete, index) => (
              <AthleteCardWithData 
                key={`${athlete.id}-${index}`} 
                athlete={athlete} 
                onAthleteClick={onAthleteClick}
                isPreview={isPreview}
              />
            ))}
        </motion.div>
        {isCarousel && (
          <>
            <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-gray-100 dark:from-gray-900 via-gray-100/80 dark:via-gray-900/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-gray-100 dark:from-gray-900 via-gray-100/80 dark:via-gray-900/80 to-transparent z-10 pointer-events-none" />
          </>
        )}
      </div>
    </div>
  );
};
