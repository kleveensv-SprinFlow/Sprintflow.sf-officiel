import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface WeightStepperProps {
  initialValue: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

const WeightStepper: React.FC<WeightStepperProps> = ({ initialValue, onChange, disabled = false }) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const step = 1.25;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleAdjust = (adjustment: number) => {
    if (disabled) return;
    const newValue = Math.max(0, (value || 0) + adjustment);
    setValue(newValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const newValue = rawValue === '' ? null : parseFloat(rawValue);
    setValue(newValue);
  };
  
  const handleInputBlur = () => {
    setIsEditing(false);
    onChange(value);
  };

  if (isEditing) {
    return (
      <input
        type="number"
        value={value === null ? '' : value}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        autoFocus
        className="w-full h-11 px-4 text-center bg-white dark:bg-gray-700 rounded-xl text-lg font-semibold border-2 border-blue-500"
        pattern="\d*\.?\d*"
      />
    );
  }

  return (
    <div className={`flex items-center justify-between w-full h-11 px-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 ${disabled ? 'opacity-50' : ''}`}>
      <button type="button" onClick={() => handleAdjust(-step)} disabled={disabled} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
        <Minus size={20} />
      </button>
      <div 
        onClick={() => !disabled && setIsEditing(true)} 
        className="flex-grow text-center text-lg font-semibold cursor-pointer"
      >
        {value !== null ? `${value.toFixed(2)} kg` : '0.00 kg'}
      </div>
      <button type="button" onClick={() => handleAdjust(step)} disabled={disabled} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
        <Plus size={20} />
      </button>
    </div>
  );
};

export default WeightStepper;