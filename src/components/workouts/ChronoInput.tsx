import React, { useState, useEffect } from 'react';

interface ChronoInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

const formatTime = (time: number | null): string => {
  if (time === null) return '';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const centiseconds = Math.round((time - Math.floor(time)) * 100);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
};

const parseTime = (str: string): number | null => {
  const parts = str.split(/[:.]/);
  if (parts.length !== 3) return null;
  const [minutes, seconds, centiseconds] = parts.map(Number);
  if (isNaN(minutes) || isNaN(seconds) || isNaN(centiseconds)) return null;
  return minutes * 60 + seconds + centiseconds / 100;
};

export const ChronoInput: React.FC<ChronoInputProps> = ({ label, value, onChange }) => {
  const [displayValue, setDisplayValue] = useState(formatTime(value));

  useEffect(() => {
    setDisplayValue(formatTime(value));
  }, [value]);

  const handleBlur = () => {
    const numericValue = parseTime(displayValue);
    onChange(numericValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 text-center">{label}</label>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full mt-1 p-1.5 text-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
        placeholder="mm:ss.cc"
      />
    </div>
  );
};
