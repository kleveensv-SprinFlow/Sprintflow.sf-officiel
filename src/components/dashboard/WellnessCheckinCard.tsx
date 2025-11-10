import React, { useState, useMemo } from 'react';
import { useWellness } from '../../hooks/useWellness.ts';
import useAuth from '../../hooks/useAuth.tsx';
import PickerWheel from '../common/PickerWheel.tsx';
import { SemanticSlider } from '../common/SemanticSlider.tsx';
import SleepDurationGauge from '../sleep/SleepDurationGauge.tsx';
import { CheckCircle2 } from 'lucide-react'; // Import de l'icône

interface WellnessCheckinCardProps {
  onClose?: () => void;
  onSuccess: () => void;
}

export const WellnessCheckinCard: React.FC<WellnessCheckinCardProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const { wellnessData, logDailyCheckin, loading } = useWellness(user?.id);

  const [bedtime, setBedtime] = useState('22:30');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState(75);
  const [stress, setStress] = useState(25);
  const [fatigue, setFatigue] = useState(25);

  const sleepDuration = useMemo(() => {
    const bedtimeDate = new Date(`2000-01-01T${bedtime}:00`);
    const wakeupDate = new Date(`2000-01-01T${wakeupTime}:00`);

    if (wakeupDate < bedtimeDate) {
      wakeupDate.setDate(wakeupDate.getDate() + 1);
    }
    return Math.round((wakeupDate.getTime() - bedtimeDate.getTime()) / (1000 * 60));
  }, [bedtime, wakeupTime]);
  
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const hasSubmittedToday = useMemo(() => 
    wellnessData?.some(log => log.date === today && log.ressenti_sommeil !== null) || false,
    [wellnessData, today]
  );

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
      
      const checkinData = {
        date: today,
        heure_coucher: bedtimeDate.toISOString(),
        heure_lever: wakeupDate.toISOString(),
        duree_sommeil_calculee: sleepDuration,
        ressenti_sommeil: sleepQuality,
        stress_level: stress,
        muscle_fatigue: fatigue,
      };

      await logDailyCheckin(checkinData);
      
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Erreur lors de la soumission du check-in:', error);
      if (onClose) onClose();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="w-8 h-8"></div> {/* Espace vide pour centrer le titre */}
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
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <PickerWheel label="Heure de coucher" value={bedtime} onChange={setBedtime} type="time" />
        <PickerWheel label="Heure de lever" value={wakeupTime} onChange={setWakeupTime} type="time" />
      </div>

      <div className="flex justify-center mb-4">
        <SleepDurationGauge sleepDuration={sleepDuration} />
      </div>

      <div className="grid grid-cols-3 gap-4 h-64 mb-4">
        <SemanticSlider label="Ressenti sommeil" minLabel="Mauvais" maxLabel="Excellent" value={sleepQuality} onChange={setSleepQuality} inverted={false} orientation="vertical" />
        <SemanticSlider label="Niveau de stress" minLabel="Faible" maxLabel="Élevé" value={stress} onChange={setStress} inverted={true} orientation="vertical" />
        <SemanticSlider label="Fatigue musculaire" minLabel="Faible" maxLabel="Élevée" value={fatigue} onChange={setFatigue} inverted={true} orientation="vertical" />
      </div>
    </div>
  );
};
