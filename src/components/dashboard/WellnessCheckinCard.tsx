import React, { useState } from 'react';
import { useWellness } from '../../hooks/useWellness';
import useAuth from '../../hooks/useAuth';

interface WellnessCheckinCardProps {
  onClose?: () => void;
}

export const WellnessCheckinCard: React.FC<WellnessCheckinCardProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { wellnessData, logDailyCheckin, loading } = useWellness(user?.id);
  const [sleep, setSleep] = useState(3);
  const [stress, setStress] = useState(3);
  const [fatigue, setFatigue] = useState(3);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const hasSubmittedToday = wellnessData?.some(log => log.date === today && log.sleep_quality) || false;

  if (hasSubmittedToday || submitted) {
    return null;
  }

  const handleSubmit = async () => {
    try {
      await logDailyCheckin({
        date: today,
        sleep_quality: sleep,
        stress_level: stress,
        muscle_fatigue: fatigue,
      });
      setSubmitted(true);
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission du check-in:', error);
    }
  };

  return (
    <div className="p-4">
      <h3 className="font-bold text-xl text-center mb-4 text-light-title dark:text-dark-title">Check-in du jour</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-light-label dark:text-dark-label">Qualité du sommeil</label>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Mauvaise</span>
            <span>Excellente</span>
          </div>
          <input type="range" min="1" max="5" value={sleep} onChange={e => setSleep(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-label dark:text-dark-label">Niveau de stress</label>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Faible</span>
            <span>Élevé</span>
          </div>
          <input type="range" min="1" max="5" value={stress} onChange={e => setStress(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-label dark:text-dark-label">Fatigue musculaire</label>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Faible</span>
            <span>Élevée</span>
          </div>
          <input type="range" min="1" max="5" value={fatigue} onChange={e => setFatigue(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
        </div>
      </div>
      <button 
        onClick={handleSubmit} 
        disabled={loading}
        className="mt-6 w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition-colors duration-300 disabled:opacity-50"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  );
};