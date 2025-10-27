// src/components/sleep/SleepForm.tsx
import React, { useState } from 'react';
import { useSleep } from '../../hooks/useSleep';
import { Bed, Star, Clock } from 'lucide-react';

interface SleepFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export const SleepForm: React.FC<SleepFormProps> = ({ onSave, onCancel }) => {
  const { saveSleepData, loading } = useSleep();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(8);
  const [quality, setQuality] = useState(4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSleepData({
        date,
        duration_hours: duration,
        quality_rating: quality,
      });
      onSave();
    } catch (error) {
      console.error("Failed to save sleep data:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
        Enregistrer votre sommeil
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date de la nuit
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="inline-block w-5 h-5 mr-2" />
            Durée du sommeil (heures)
          </label>
          <input
            id="duration"
            type="range"
            min="0"
            max="16"
            step="0.5"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="text-center font-semibold text-lg text-primary-600 dark:text-primary-400 mt-2">
            {duration.toFixed(1)} heures
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Star className="inline-block w-5 h-5 mr-2" />
            Qualité du sommeil
          </label>
          <div className="flex justify-center items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setQuality(rating)}
                className={`p-2 rounded-full transition-transform duration-200 ${
                  quality >= rating
                    ? 'text-yellow-400 scale-110'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <Star fill="currentColor" className="w-8 h-8" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
};