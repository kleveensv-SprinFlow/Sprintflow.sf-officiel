import React, { useState, useMemo } from 'react';
import { useWellness } from '../../hooks/useWellness.ts';
import useAuth from '../../hooks/useAuth.tsx';
import PickerWheel from '../common/PickerWheel.tsx';
import { SemanticSlider } from '../common/SemanticSlider.tsx';
import SleepDurationGauge from '../sleep/SleepDurationGauge.tsx';
import { CheckCircle2 } from 'lucide-react'; 
import { motion } from 'framer-motion';

interface WellnessCheckinCardProps {
  onClose?: () => void;
  onSuccess: () => void;
}

export const WellnessCheckinCard: React.FC<WellnessCheckinCardProps> = ({ onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const { wellnessData, logDailyCheckin, loading } = useWellness(user?.id);

  const [bedtime, setBedtime] = useState('22:30');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState(75);
  const [stress, setStress] = useState(25);
  const [fatigue, setFatigue] = useState(25);
  const [energy, setEnergy] = useState(75);
  const [mood, setMood] = useState(75);
  const [menstruations, setMenstruations] = useState(false);

  const sleepDuration = useMemo(() => {
    const bedtimeDate = new Date(`2000-01-01T${bedtime}:00`);
    const wakeupDate = new Date(`2000-01-01T${wakeupTime}:00`);

    if (wakeupDate < bedtimeDate) {
      wakeupDate.setDate(wakeupDate.getDate() + 1);
    }
    return Math.round((wakeupDate.getTime() - bedtimeDate.getTime()) / (1000 * 60));
  }, [bedtime, wakeupTime]);
  
  // Use local date for check-in to handle timezone correctly
  const today = useMemo(() => {
    const d = new Date();
    // Offset in milliseconds
    const offset = d.getTimezoneOffset() * 60000;
    // Calculate local time
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  }, []);
  
  const hasSubmittedToday = useMemo(() => 
    wellnessData?.some(log => log.date === today && log.ressenti_sommeil !== null) || false,
    [wellnessData, today]
  );

  // Conditional check for female profile to show menstrual option
  const isFemale = useMemo(() => {
    return profile?.sexe === 'femme';
  }, [profile]);

  if (!user) return null;
  if (hasSubmittedToday) return null;

  const handleSubmit = async () => {
    if (loading) return;
    try {
      const bedtimeDate = new Date(`${today}T${bedtime}:00`);
      const wakeupDate = new Date(`${today}T${wakeupTime}:00`);

      if (wakeupDate < bedtimeDate) {
        wakeupDate.setDate(wakeupDate.getDate() + 1);
      }
      
      const checkinData: any = {
        date: today,
        heure_coucher: bedtimeDate.toISOString(),
        heure_lever: wakeupDate.toISOString(),
        duree_sommeil_calculee: sleepDuration,
        ressenti_sommeil: sleepQuality,
        stress_level: stress,
        muscle_fatigue: fatigue,
        energie_subjective: energy,
        humeur_subjective: mood,
      };

      if (isFemale) {
        checkinData.menstruations = menstruations;
      }

      await logDailyCheckin(checkinData);
      
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Erreur lors de la soumission du check-in:', error);
      if (onClose) onClose();
    }
  };

  return (
    <div className="p-4 pb-20 overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-center mb-4">
        <div className="w-8 h-8"></div> 
        <h3 className="font-bold text-xl text-center text-light-title dark:text-dark-title">
          Check-in du matin
        </h3>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="text-primary disabled:opacity-50 p-1"
        >
          {loading ? (
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          ) : (
            <CheckCircle2 size={28} />
          )}
        </button>
      </div>
      
      {/* Sleep Times */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <PickerWheel label="Coucher" value={bedtime} onChange={setBedtime} type="time" />
        <PickerWheel label="Lever" value={wakeupTime} onChange={setWakeupTime} type="time" />
      </div>

      <div className="flex justify-center mb-4">
        <SleepDurationGauge sleepDuration={sleepDuration} />
      </div>

      {/* Sliders Grid - Expanded to 5 sliders */}
      <div className="grid grid-cols-5 gap-2 h-64 mb-4">
        <SemanticSlider label="Sommeil" minLabel="-" maxLabel="+" value={sleepQuality} onChange={setSleepQuality} inverted={false} orientation="vertical" />
        <SemanticSlider label="Énergie" minLabel="-" maxLabel="+" value={energy} onChange={setEnergy} inverted={false} orientation="vertical" />
        <SemanticSlider label="Humeur" minLabel="-" maxLabel="+" value={mood} onChange={setMood} inverted={false} orientation="vertical" />
        <SemanticSlider label="Stress" minLabel="-" maxLabel="+" value={stress} onChange={setStress} inverted={true} orientation="vertical" />
        <SemanticSlider label="Fatigue" minLabel="-" maxLabel="+" value={fatigue} onChange={setFatigue} inverted={true} orientation="vertical" />
      </div>

      {/* Cycle Toggle for Women */}
      {isFemale && (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-between border border-red-100 dark:border-red-900/50"
        >
            <div className="flex flex-col">
                <span className="text-sm font-medium text-red-800 dark:text-red-200">Cycle menstruel</span>
                <span className="text-xs text-red-600 dark:text-red-300">Avez-vous vos règles aujourd'hui ?</span>
            </div>
            <button 
                onClick={() => setMenstruations(!menstruations)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${menstruations ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
                <span
                    className={`${menstruations ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </button>
        </motion.div>
      )}
    </div>
  );
};
