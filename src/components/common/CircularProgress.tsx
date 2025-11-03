import React from 'react';

interface CircularProgressProps {
  value: number; // 0-100
  strokeWidth?: number;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value, strokeWidth = 10, className }) => {
  const size = 100; // Use a fixed viewBox size for consistent calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  const getGradientColor = (percentage: number) => {
    const p = Math.max(0, Math.min(100, percentage));
    const hue = (p / 100) * 120; // 0 (red) to 120 (green)
    return `hsl(${hue}, 80%, 50%)`;
  };

  const color = getGradientColor(value);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={`${className} -rotate-90`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        className="text-gray-200 dark:text-gray-700"
        fill="transparent"
        stroke="currentColor"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="transparent"
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease-out',
        }}
      />
    </svg>
  );
};

export default CircularProgress;
