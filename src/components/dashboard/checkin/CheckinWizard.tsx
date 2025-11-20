import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import useAuth from '../../../hooks/useAuth.tsx';
import { useWellness } from '../../../hooks/useWellness.ts';
import { SprintyAdvice } from '../SprintyAdvice.tsx';
import { StepSleep } from './steps/StepSleep.tsx';
import { StepWellness } from './steps/StepWellness.tsx';
import { StepCycle } from './steps/StepCycle.tsx';
import { StepSummary } from './steps/StepSummary.tsx';

interface CheckinWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'sleep' | 'wellness' | 'cycle' | 'summary';

export const CheckinWizard: React.FC<CheckinWizardProps> = ({ onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const { logDailyCheckin, loading } = useWellness(user?.id);

  // State
  const [step, setStep] = useState<Step>('sleep');
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState(75);
  const [stress, setStress] = useState(25);
  const [fatigue, setFatigue] = useState(25);
  const [energy, setEnergy] = useState(75);
  const [mood, setMood] = useState(75);
  const [menstruations, setMenstruations] = useState(false);

  // Derived State
  const isFemale = useMemo(() => profile?.sexe === 'femme', [profile]);
  
  const sleepDuration = useMemo(() => {
    const bedtimeDate = new Date(`2000-01-01T${bedtime}:00`);
    const wakeupDate = new Date(`2000-01-01T${wakeupTime}:00`);

    if (wakeupDate < bedtimeDate) {
      wakeupDate.setDate(wakeupDate.getDate() + 1);
    }
    return Math.round((wakeupDate.getTime() - bedtimeDate.getTime()) / (1000 * 60));
  }, [bedtime, wakeupTime]);

  // Navigation Logic
  const nextStep = () => {
    if (step === 'sleep') setStep('wellness');
    else if (step === 'wellness') setStep(isFemale ? 'cycle' : 'summary');
    else if (step === 'cycle') setStep('summary');
  };

  const prevStep = () => {
    if (step === 'summary') setStep(isFemale ? 'cycle' : 'wellness');
    else if (step === 'cycle') setStep('wellness');
    else if (step === 'wellness') setStep('sleep');
  };

  // Submission Logic
  const handleSubmit = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const bedtimeDate = new Date(`${today}T${bedtime}:00`);
      const wakeupDate = new Date(`${today}T${wakeupTime}:00`);
      if (wakeupDate < bedtimeDate) wakeupDate.setDate(wakeupDate.getDate() + 1);

      await logDailyCheckin({
        date: today,
        heure_coucher: bedtimeDate.toISOString(),
        heure_lever: wakeupDate.toISOString(),
        duree_sommeil_calculee: sleepDuration,
        ressenti_sommeil: sleepQuality,
        stress_level: stress,
        muscle_fatigue: fatigue,
        energie_subjective: energy,
        humeur_subjective: mood,
        menstruations: isFemale ? menstruations : false
      });
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  // Animation Variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
    if (newDirection > 0) nextStep();
    else prevStep();
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 px-2">
         {step !== 'sleep' ? (
            <button onClick={() => paginate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
              <ChevronLeft className="w-6 h-6" />
            </button>
         ) : (
            <div className="w-10" />
         )}
         <h2 className="font-bold text-lg">Check-in Quotidien</h2>
         <div className="w-10" /> 
      </div>

      {/* Sprinty Advice */}
      <SprintyAdvice step={step} />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4 relative">
        <AnimatePresence initial={false} custom={direction} mode='wait'>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full"
            >
              {step === 'sleep' && (
                <StepSleep
                  bedtime={bedtime} setBedtime={setBedtime}
                  wakeupTime={wakeupTime} setWakeupTime={setWakeupTime}
                  sleepDuration={sleepDuration}
                  sleepQuality={sleepQuality} setSleepQuality={setSleepQuality}
                />
              )}
              {step === 'wellness' && (
                <StepWellness
                  stress={stress} setStress={setStress}
                  fatigue={fatigue} setFatigue={setFatigue}
                  energy={energy} setEnergy={setEnergy}
                  mood={mood} setMood={setMood}
                />
              )}
              {step === 'cycle' && (
                <StepCycle menstruations={menstruations} setMenstruations={setMenstruations} />
              )}
              {step === 'summary' && (
                <StepSummary
                  sleepDuration={sleepDuration}
                  sleepQuality={sleepQuality}
                  energy={energy}
                  mood={mood}
                  stress={stress}
                  fatigue={fatigue}
                  menstruations={menstruations}
                  onSubmit={handleSubmit}
                  isSubmitting={loading}
                />
              )}
            </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation (only for non-summary steps) */}
      {step !== 'summary' && (
        <div className="pt-4 pb-6 px-4 border-t border-gray-100 dark:border-white/5 mt-auto">
          <button
            onClick={() => paginate(1)}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
          >
            Suivant <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};