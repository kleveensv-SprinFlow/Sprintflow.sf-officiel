import React from 'react';

interface SleepDurationGaugeProps {
  sleepDuration: number; // in minutes
}

const SleepDurationGauge: React.FC<SleepDurationGaugeProps> = ({ sleepDuration }) => {
  const hours = Math.floor(sleepDuration / 60);
  const minutes = sleepDuration % 60;

  const circumference = 2 * Math.PI * 50; // 50 is the radius

  const getStrokeColor = (duration: number): string => {
    const hours = duration / 60;
    if (hours < 7) return '#ef4444'; // red-500
    if (hours >= 7 && hours < 8) return '#f97316'; // orange-500
    if (hours >= 8 && hours <= 10) return '#22c55e'; // green-500
    return '#f97316'; // orange-500 for > 10 hours
  };
  
  const color = getStrokeColor(sleepDuration);

  // We'll use a simple circle for now and add the gradient later if needed.
  // The progress will be represented by the strokeDashoffset.
  // For now, it is a static full circle.
  const progressOffset = 0;

  return (
    <div className="relative flex items-center justify-center w-48 h-48 my-4">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          strokeWidth="12"
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          strokeWidth="12"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {hours}h {minutes > 0 ? `${minutes}m` : ''}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">de sommeil</span>
      </div>
    </div>
  );
};

export default SleepDurationGauge;