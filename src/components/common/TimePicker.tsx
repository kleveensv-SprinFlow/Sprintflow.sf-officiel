import React, { useState, useEffect } from 'react';

interface TimePickerProps {
  initialTime: string; // "MM:SS"
  onChange: (time: string) => void;
}

const TimeInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  max: number;
  label: string;
}> = ({ value, onChange, max, label }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? 0 : Number(e.target.value);
    if (newValue >= 0 && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="number"
        value={value.toString().padStart(2, '0')}
        onChange={handleChange}
        className="w-20 h-16 text-center bg-white dark:bg-gray-800 text-3xl font-semibold !text-black dark:!text-white border-none rounded-lg focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</span>
    </div>
  );
};

const TimePicker: React.FC<TimePickerProps> = ({ initialTime, onChange }) => {
  const parseTime = (time: string) => {
    const parts = time.split(':');
    if (parts.length === 2) {
        const [min, sec] = parts.map(Number);
        if (!isNaN(min) && !isNaN(sec)) {
            return { min, sec };
        }
    }
    return { min: 0, sec: 0 }; // Fallback for invalid format
  };

  const [minutes, setMinutes] = useState(parseTime(initialTime).min);
  const [seconds, setSeconds] = useState(parseTime(initialTime).sec);

  useEffect(() => {
    const newTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    onChange(newTime);
  }, [minutes, seconds, onChange]);

  return (
    <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-gray-100 dark:bg-gray-900/50">
      <TimeInput value={minutes} onChange={setMinutes} max={59} label="min" />
      <span className="text-3xl font-semibold text-gray-400 dark:text-gray-500 pb-4">:</span>
      <TimeInput value={seconds} onChange={setSeconds} max={59} label="sec" />
    </div>
  );
};

export default TimePicker;