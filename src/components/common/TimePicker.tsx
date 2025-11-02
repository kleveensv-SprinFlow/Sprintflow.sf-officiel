import React, { useState } from 'react';
import { Clock, Check } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const QUICK_TIMES = [
  { label: '30s', value: '30s' },
  { label: '1m', value: '1m' },
  { label: '1m30s', value: '1m30s' },
  { label: '2m', value: '2m' },
  { label: '3m', value: '3m' },
  { label: '5m', value: '5m' },
  { label: '8m', value: '8m' },
  { label: '10m', value: '10m' },
];

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  className = ''
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState(value);

  const isQuickTime = QUICK_TIMES.some(t => t.value === value);

  const handleQuickSelect = (timeValue: string) => {
    onChange(timeValue);
    setShowCustom(false);
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue);
      setShowCustom(false);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          {label}
        </label>
      )}

      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_TIMES.map((time) => (
            <button
              key={time.value}
              type="button"
              onClick={() => handleQuickSelect(time.value)}
              className={`
                relative px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${value === time.value
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                active:scale-95
              `}
            >
              {value === time.value && (
                <Check className="absolute top-1 right-1 w-3 h-3" />
              )}
              {time.label}
            </button>
          ))}
        </div>

        {!showCustom ? (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
          >
            <Clock className="w-4 h-4" />
            <span>{!isQuickTime ? value : 'Temps personnalisé'}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="ex: 2m30s"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-blue-300 dark:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors active:scale-95"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors active:scale-95"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
