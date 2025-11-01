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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-2">Check-in du jour</h3>
      <div className="space-y-3">
        {/* Sleep */}
        <div>
          <label className="block text-sm">Qualité du sommeil</label>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Mauvaise</span>
            <span>Excellente</span>
          </div>
          <input type="range" min="1" max="5" value={sleep} onChange={e => setSleep(parseInt(e.target.value))} className="w-full" />
        </div>
        {/* Stress */}
        <div>
          <label className="block text-sm">Niveau de stress</label>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Faible</span>
            <span>Élevé</span>
          </div>
          <input type="range" min="1" max="5" value={stress} onChange={e => setStress(parseInt(e.target.value))} className="w-full" />
        </div>
        {/* Fatigue */}
        <div>
          <label className="block text-sm">Fatigue musculaire</label>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Faible</span>
            <span>Élevée</span>
          </div>
          <input type="range" min="1" max="5" value={fatigue} onChange={e => setFatigue(parseInt(e.target.value))} className="w-full" />
        </div>
      </div>
      <button 
        onClick={handleSubmit} 
        disabled={loading}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  );
};
