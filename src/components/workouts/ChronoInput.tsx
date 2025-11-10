import React, { useState, useEffect } from 'react';

interface ChronoInputProps {
  value: number | null; // en secondes
  onChange: (newSeconds: number | null) => void;
}

const formatValue = (val: number | null): string => {
  if (val === null || isNaN(val)) return '';
  const seconds = Math.floor(val);
  const centiseconds = Math.round((val - seconds) * 100);
  return `${String(seconds).padStart(2, '0')},${String(centiseconds).padStart(2, '0')}`;
};

const parseValue = (str: string): number | null => {
  const cleaned = str.replace(/[^0-9,.]/g, '').replace(',', '.');
  if (cleaned === '') return null;
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  
  if (!cleaned.includes('.')) {
    if (cleaned.length <= 2) {
      return num / 100;
    }
    const seconds = parseInt(cleaned.slice(0, -2), 10);
    const centiseconds = parseInt(cleaned.slice(-2), 10);
    return seconds + centiseconds / 100;
  }

  return num;
};

export const ChronoInput: React.FC<ChronoInputProps> = ({ value, onChange }) => {
  const [displayValue, setDisplayValue] = useState(formatValue(value));

  useEffect(() => {
    if (parseValue(displayValue) !== value) {
      setDisplayValue(formatValue(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    const parsed = parseValue(inputValue);
    onChange(parsed);
  };

  const handleBlur = () => {
    setDisplayValue(formatValue(value));
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="00,00"
      className="w-full text-center px-2 py-3 text-2xl font-mono bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:border-blue-500 focus:ring-0 transition"
    />
  );
};

export default ChronoInput;