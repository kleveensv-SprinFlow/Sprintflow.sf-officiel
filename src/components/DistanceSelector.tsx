import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface DistanceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  presetDistances?: string[];
}

export const DistanceSelector: React.FC<DistanceSelectorProps> = ({
  value,
  onChange,
  label,
  className = '',
  presetDistances = ['30m', '40m', '50m', '60m', '80m', '100m', '110m', '120m', '150m', '200m', '250m', '300m', '400m']
}) => {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [customValue, setCustomValue] = useState('');

  const handlePresetChange = (direction: 'up' | 'down') => {
    const currentIndex = presetDistances.indexOf(value);

    if (direction === 'up' && currentIndex < presetDistances.length - 1) {
      onChange(presetDistances[currentIndex + 1]);
    } else if (direction === 'down' && currentIndex > 0) {
      onChange(presetDistances[currentIndex - 1]);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
      setMode('preset');
      setCustomValue('');
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {mode === 'preset' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePresetChange('down')}
              disabled={presetDistances.indexOf(value) === 0}
              className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Minus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>

            <div className="w-24 h-12 flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-xl">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {value}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handlePresetChange('up')}
              disabled={presetDistances.indexOf(value) === presetDistances.length - 1}
              className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMode('custom')}
            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            ✏️ Saisir une distance personnalisée
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Ex: 250m, 1km, 5x100m..."
              className="flex-1 px-3 py-2 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCustomSubmit();
                }
              }}
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              OK
            </button>
          </div>
          <button
            type="button"
            onClick={() => setMode('preset')}
            className="w-full text-xs text-gray-600 dark:text-gray-400 hover:underline"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
};
