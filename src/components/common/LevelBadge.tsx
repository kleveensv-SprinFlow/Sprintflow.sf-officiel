import React from 'react';

interface LevelBadgeProps {
  level: number;
  progress?: number; // From 0 to 100
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ level, progress = 0 }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative h-8 w-8 flex items-center justify-center">
      <svg className="absolute w-full h-full" viewBox="0 0 44 44">
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="22"
          cy="22"
        />
        <circle
          className="text-primary"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="22"
          cy="22"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>
      <span className="relative text-sm font-bold text-gray-800 dark:text-gray-200">
        {level}
      </span>
    </div>
  );
};

export default LevelBadge;
