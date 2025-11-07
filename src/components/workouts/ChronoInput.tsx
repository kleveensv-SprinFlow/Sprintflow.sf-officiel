import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChronoSelector } from './ChronoSelector';

interface ChronoInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

const formatDisplayTime = (timeInSeconds: number | null): string => {
  if (timeInSeconds === null) return 'mm:ss.cc';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const centiseconds = Math.round((timeInSeconds - (minutes * 60) - seconds) * 100);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (minutes > 0) {
    return `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  }
  return `${pad(seconds)}.${pad(centiseconds)}`;
};

export const ChronoInput: React.FC<ChronoInputProps> = ({ label, value, onChange }) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleSelect = (newValue: number) => {
    onChange(newValue);
    setIsSelectorOpen(false);
  };

  return (
    <div>
      <label className="block text-xs text-center text-gray-500 dark:text-gray-400">{label}</label>
      <button
        type="button"
        onClick={() => setIsSelectorOpen(true)}
        className={`w-full mt-1 p-1.5 text-center rounded-md border ${
          value === null
            ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
            : 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700 font-semibold'
        }`}
      >
        {formatDisplayTime(value)}
      </button>

      <AnimatePresence>
        {isSelectorOpen && (
          <ChronoSelector
            initialValue={value}
            onChange={handleSelect}
            onClose={() => setIsSelectorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};