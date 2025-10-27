import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface DistanceInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  label?: string;
  className?: string;
  step?: number;
}

export const DistanceInput: React.FC<DistanceInputProps> = ({
  value,
  onChange,
  label,
  className = '',
  step = 10,
}) => {
  const handleDecrement = () => {
    const currentValue = typeof value === 'number' ? value : 0;
    onChange(Math.max(0, currentValue - step));
  };

  const handleIncrement = () => {
    const currentValue = typeof value === 'number' ? value : 0;
    onChange(currentValue + step);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
      onChange('');
      return;
    }
    const numValue = parseInt(rawValue, 10);
    onChange(isNaN(numValue) ? '' : numValue);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleDecrement}
          className="px-3 py-2 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-l-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          placeholder="200"
          className="w-full px-2 py-1.5 text-center text-sm border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="px-3 py-2 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};