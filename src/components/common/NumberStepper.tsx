import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  className?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  suffix,
  className = ''
}) => {
  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="flex items-center justify-center w-12 h-12 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
        >
          <Minus className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>

        <div className="flex-1 flex items-center justify-center px-4 h-12 bg-white dark:bg-gray-800">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="w-full text-center text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-0 focus:outline-none focus:ring-0 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {suffix && (
            <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              {suffix}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="flex items-center justify-center w-12 h-12 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
        >
          <Plus className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
      </div>
    </div>
  );
};
