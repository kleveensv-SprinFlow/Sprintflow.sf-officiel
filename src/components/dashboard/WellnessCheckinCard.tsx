import React, { useState, useEffect } from 'react';
import { useWellness } from '../../hooks/useWellness';
import useAuth from '../../hooks/useAuth';

export const WellnessCheckinCard = () => {
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
    } catch (error) {
      console.error('Erreur lors de la soumission du check-in:', error);
    }
  };

  return (
    <div className="bg-light-card dark:bg-dark-card shadow-card-light dark:shadow-card-dark p-4 rounded-lg">
      <h3 className="font-semibold mb-2 text-light-title dark:text-dark-title">Check-in du jour</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-light-label dark:text-dark-label">Qualité du sommeil</label>
          <div className="flex justify-between text-xs text-light-label dark:text-dark-label opacity-70">
            <span>Mauvaise</span>
            <span>Excellente</span>
          </div>
          <input type="range" min="1" max="5" value={sleep} onChange={e => setSleep(parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm text-light-label dark:text-dark-label">Niveau de stress</label>
          <div className="flex justify-between text-xs text-light-label dark:text-dark-label opacity-70">
            <span>Faible</span>
            <span>Élevé</span>
          </div>
          <input type="range" min="1" max="5" value={stress} onChange={e => setStress(parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm text-light-label dark:text-dark-label">Fatigue musculaire</label>
          <div className="flex justify-between text-xs text-light-label dark:text-dark-label opacity-70">
            <span>Faible</span>
            <span>Élevée</span>
          </div>
          <input type="range" min="1" max="5" value={fatigue} onChange={e => setFatigue(parseInt(e.target.value))} className="w-full" />
        </div>
      </div>
      <button 
        onClick={handleSubmit} 
        disabled={loading}
        className="mt-4 w-full bg-sprintflow-blue text-white py-2 rounded-lg font-semibold"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  );
};