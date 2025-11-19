import React from 'react';
import { motion } from 'framer-motion';

interface GaugeProps {
  value: number;
  color: string;
  label: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, color, label }) => {
  const normalized = Math.max(0, Math.min(100, value));
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - normalized / 100);

  return (
    <div className="flex-1 bg-sprint-light-card dark:bg-sprint-dark-card p-4 rounded-2xl shadow-md">
      <h3 className="text-sm font-medium text-sprint-light-text-primary dark:text-sprint-dark-text-primary mb-4">
        {label}
      </h3>
      <div className="relative w-full flex justify-center items-center">
        <svg width={120} height={120} className="transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="10"
            fill="transparent"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </svg>
        <span className="absolute text-2xl font-bold text-sprint-light-text-primary dark:text-sprint-dark-text-primary">
          {Math.round(normalized)}
        </span>
      </div>
    </div>
  );
};

interface IndicesPanelProps {
  formIndex?: number;
  weightPowerRatio?: number;
}

/**
 * Panneau qui affiche les deux indices côte à côte.
 */
const IndicesPanel: React.FC<IndicesPanelProps> = ({
  formIndex = 0,
  weightPowerRatio = 0,
}) => {
  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
      <Gauge
        value={formIndex}
        color="#22C55E"
        label="Indice de forme"
      />
      <Gauge
        value={weightPowerRatio}
        color="#F97316"
        label="Rapport poids/puissance"
      />
    </div>
  );
};

export default IndicesPanel;
