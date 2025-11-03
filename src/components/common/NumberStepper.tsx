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

        <div className="relative flex-1 h-12">
          <input
            type="number"
            value={value}
            onChange={(e) => {
                const newValue = e.target.value === '' ? min : Number(e.target.value);
                if (newValue >= min && newValue <= max) {
                    onChange(newValue);
                }
            }}
            className="w-full h-full px-2 text-center bg-white dark:bg-gray-800 text-lg font-semibold !text-black dark:!text-white border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400 pointer-events-none">
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