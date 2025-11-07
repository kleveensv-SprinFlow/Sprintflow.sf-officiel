import React, { useState, useMemo } from 'react';
import { useWellness } from '../../hooks/useWellness';
import useAuth from '../../hooks/useAuth';
import { SemanticSlider } from '../common/SemanticSlider';

interface WellnessCheckinCardProps {
  onClose?: () => void;
}

export const WellnessCheckinCard: React.FC<WellnessCheckinCardProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { wellnessData, logDailyCheckin, getIndiceForme, loading } = useWellness(user?.id);

  const [bedtime, setBedtime] = useState('22:30');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState(75);
  const [stress, setStress] = useState(25);
  const [fatigue, setFatigue] = useState(25);
  const [submitted, setSubmitted] = useState(false);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const hasSubmittedToday = useMemo(() =>
    wellnessData?.some(log => log.date === today && log.ressenti_sommeil !== null) || false,
    [wellnessData, today]
  );

  if (!user) return null;
  if (hasSubmittedToday || submitted) return null;

  const handleSubmit = async () => {
    try {
      const bedtimeDate = new Date(`${today}T${bedtime}:00`);
      const wakeupDate = new Date(`${today}T${wakeupTime}:00`);

      if (wakeupDate < bedtimeDate) {
        wakeupDate.setDate(wakeupDate.getDate() + 1);
      }

      const bedtimeISO = bedtimeDate.toISOString();
      const wakeupISO = wakeupDate.toISOString();

      const checkinData = {
        date: today,
        heure_coucher: bedtimeISO,
        heure_lever: wakeupISO,
        duree_sommeil_calculee: Math.round((wakeupDate.getTime() - bedtimeDate.getTime()) / (1000 * 60)),
        ressenti_sommeil: sleepQuality,
        stress_level: stress,
        muscle_fatigue: fatigue,
      };

      await logDailyCheckin(checkinData);

      const indiceResult = await getIndiceForme({
          heure_coucher: bedtimeISO,
          heure_lever: wakeupISO,
          ressenti_sommeil: sleepQuality,
          stress_level: stress,
          muscle_fatigue: fatigue
      });

      console.log('Indice de Forme calculé:', indiceResult);

      setSubmitted(true);
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission du check-in:', error);
    }
  };

  return (
    <div className="p-4">
      <h3 className="font-bold text-xl text-center mb-6 text-light-title dark:text-dark-title">Check-in du matin</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-light-label dark:text-dark-label mb-2">
            Heure de coucher
          </label>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="w-full h-11 px-4 bg-white dark:bg-gray-700 rounded-xl text-base font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-label dark:text-dark-label mb-2">
            Heure de lever
          </label>
          <input
            type="time"
            value={wakeupTime}
            onChange={(e) => setWakeupTime(e.target.value)}
            className="w-full h-11 px-4 bg-white dark:bg-gray-700 rounded-xl text-base font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="space-y-6">
        <SemanticSlider
          label="Ressenti du sommeil"
          minLabel="Mauvais"
          maxLabel="Excellent"
          value={sleepQuality}
          onChange={setSleepQuality}
          inverted={false}
        />
        <SemanticSlider
          label="Niveau de stress"
          minLabel="Faible"
          maxLabel="Élevé"
          value={stress}
          onChange={setStress}
          inverted={true}
        />
        <SemanticSlider
          label="Fatigue musculaire"
          minLabel="Faible"
          maxLabel="Élevée"
          value={fatigue}
          onChange={setFatigue}
          inverted={true}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-8 w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition-colors duration-300 disabled:opacity-50"
      >
        {loading ? 'Calcul en cours...' : 'Valider mon état de forme'}
      </button>
    </div>
  );
};
