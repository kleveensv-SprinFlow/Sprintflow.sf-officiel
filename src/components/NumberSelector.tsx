import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberSelectorProps {
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  label: string;
  className?: string;
}

export const NumberSelector: React.FC<NumberSelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
  className = ''
}) => {
  const handleDecrement = () => {
    const currentValue = typeof value === 'number' ? value : 0;
    if (currentValue > min) {
      onChange(currentValue - 1);
    }
  };

  const handleIncrement = () => {
    const currentValue = typeof value === 'number' ? value : min - 1;
    if (currentValue < max) {
      onChange(currentValue + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
      onChange('');
      return;
    }
    const num = parseInt(rawValue, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 text-center">
        {label}
      </label>
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value !== '' && value <= min}
          className="p-1 sm:p-2 bg-gray-200 dark:bg-gray-700 rounded-l-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <Minus size={16} />
        </button>

        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          placeholder="--"
          className="w-12 sm:w-16 h-10 text-center font-bold text-base sm:text-lg bg-white dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value !== '' && value >= max}
          className="p-1 sm:p-2 bg-gray-200 dark:bg-gray-700 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};