import React from 'react';

interface SleepDurationGaugeProps {
  sleepDuration: number; // in minutes
}

const SleepDurationGauge: React.FC<SleepDurationGaugeProps> = ({ sleepDuration }) => {
  const hours = Math.floor(sleepDuration / 60);
  const minutes = sleepDuration % 60;
  const totalHours = sleepDuration / 60;

  const circumference = 2 * Math.PI * 50; // 50 is the radius

  const getColorStops = (durationHours: number): { offset: string; color: string }[] => {
    if (durationHours < 7) return [{ offset: '0%', color: '#ef4444' }, { offset: '100%', color: '#f87171' }];
    if (durationHours < 8) {
      const percentage = (durationHours - 7);
      return [{ offset: '0%', color: '#f97316' }, { offset: `${percentage * 100}%`, color: '#fbbf24' }, { offset: '100%', color: '#a3e635' }];
    }
    if (durationHours <= 10) return [{ offset: '0%', color: '#22c55e' }, { offset: '100%', color: '#4ade80' }];
    // Inverse gradient for > 10h
    const percentage = Math.min(1, (durationHours - 10) / 2); // Cap at 12h for orange
    return [{ offset: '0%', color: '#a3e635' }, { offset: `${percentage * 100}%`, color: '#fbbf24' }, { offset: '100%', color: '#f97316' }];
  };

  const colorStops = getColorStops(totalHours);
  const progress = Math.min(totalHours / 12, 1); // Max out gauge at 12 hours
  const progressOffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center w-40 h-40 my-2">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            {colorStops.map((stop, index) => (
              <stop key={index} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>
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
          stroke="url(#sleepGradient)"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: colorStops[0].color }}>
          {hours}h {minutes > 0 ? `${minutes.toString().padStart(2, '0')}` : ''}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 -mt-1">de sommeil</span>
      </div>
    </div>
  );
};

export default SleepDurationGauge;
