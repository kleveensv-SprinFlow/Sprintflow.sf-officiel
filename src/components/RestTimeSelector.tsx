import React from 'react';
import { Clock } from 'lucide-react';

interface RestTimeSelectorProps {
  value?: number; // en secondes
  onChange: (seconds: number | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const RestTimeSelector: React.FC<RestTimeSelectorProps> = ({
  value,
  onChange,
  label = "Temps de repos",
  placeholder = "Optionnel",
  className = ""
}) => {
  // Convertir les secondes en minutes et secondes
  const minutes = value ? Math.floor(value / 60) : 0;
  const seconds = value ? value % 60 : 0;

  const handleMinutesChange = (newMinutes: number) => {
    const totalSeconds = newMinutes * 60 + seconds;
    onChange(totalSeconds > 0 ? totalSeconds : undefined);
  };

  const handleSecondsChange = (newSeconds: number) => {
    const totalSeconds = minutes * 60 + newSeconds;
    onChange(totalSeconds > 0 ? totalSeconds : undefined);
  };

  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <div className={className}>
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
        <Clock className="h-3 w-3 inline mr-1" />
        {label}
      </label>
      
      <div className="flex items-center space-x-2">
        {/* Sélecteur minutes */}
        <div className="flex-1">
          <select
            value={minutes}
            onChange={(e) => handleMinutesChange(parseInt(e.target.value))}
            className="w-full px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-gray-900 dark:text-white text-xs"
          >
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i} value={i}>
                {i} min
              </option>
            ))}
          </select>
        </div>

        <span className="text-gray-500 dark:text-gray-400 text-xs">:</span>

        {/* Sélecteur secondes */}
        <div className="flex-1">
          <select
            value={seconds}
            onChange={(e) => handleSecondsChange(parseInt(e.target.value))}
            className="w-full px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-gray-900 dark:text-white text-xs"
          >
            {[0, 15, 30, 45].map((s) => (
              <option key={s} value={s}>
                {s.toString().padStart(2, '0')}s
              </option>
            ))}
          </select>
        </div>

        {/* Bouton effacer */}
        {value && value > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs transition-colors"
            title="Effacer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Affichage du total */}
      {value && value > 0 && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Total: {Math.floor(value / 60)}:{(value % 60).toString().padStart(2, '0')} ({value}s)
        </div>
      )}
      
      {(!value || value === 0) && (
        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {placeholder}
        </div>
      )}
    </div>
  );
};