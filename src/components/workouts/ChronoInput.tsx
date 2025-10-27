import React, { useState, ChangeEvent, useEffect } from 'react';

interface ChronoInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
}

// Helper to format a number (e.g., 10.72) into a display string (e.g., "10.72")
const formatToDisplay = (value: number | null): string => {
  if (value === null || isNaN(value)) return '';
  // Ensure we handle floating point inaccuracies
  const totalHundredths = Math.round(value * 100);
  const seconds = Math.floor(totalHundredths / 100);
  const hundredths = totalHundredths % 100;
  return `${seconds}.${hundredths.toString().padStart(2, '0')}`;
};

// Helper to parse a raw string (e.g., "1072") into a number (e.g., 10.72)
const parseToNumber = (displayValue: string): number | null => {
    const digits = displayValue.replace(/[^0-9]/g, '');
    if (digits.length === 0) return null;

    // Handle cases like "72" -> 0.72
    if (digits.length <= 2) {
        return parseFloat(`0.${digits.padStart(2, '0')}`);
    }

    // Handle "1072" -> 10.72
    const seconds = digits.slice(0, -2);
    const hundredths = digits.slice(-2);
    return parseFloat(`${seconds}.${hundredths}`);
};


export const ChronoInput: React.FC<ChronoInputProps> = ({
  value,
  onChange,
  placeholder = '__.__',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(formatToDisplay(value));

  // Sync display value with external changes
  useEffect(() => {
    setDisplayValue(formatToDisplay(value));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numValue = parseToNumber(input);

    // Keep the displayed text formatted while typing
    const digits = input.replace(/[^0-9]/g, '');
    let formattedDisplay = '';
    if (digits.length > 0) {
        if (digits.length <= 2) {
            formattedDisplay = `.${digits.padStart(2, '0')}`;
        } else {
            const seconds = digits.slice(0, -2);
            const hundredths = digits.slice(-2);
            formattedDisplay = `${seconds}.${hundredths}`;
        }
    }

    setDisplayValue(formattedDisplay);
    onChange(numValue);
  };
  
  // On blur, format to a consistent display
  const handleBlur = () => {
    setDisplayValue(formatToDisplay(value));
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`w-full px-2 py-1.5 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 ${className}`}
    />
  );
};