import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface CircularProgressProps {
  value: number; // 0-100
  strokeWidth?: number;
  className?: string;
  glow?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value, strokeWidth = 10, className, glow = false }) => {
  const size = 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const motionValue = useMotionValue(0);
  
  const strokeDashoffset = useTransform(motionValue, [0, 100], [circumference, 0]);
  // Transitions de couleur discrètes: <50 Rouge, 50-79 Ambre, >=80 Vert
  const color = useTransform(motionValue, [0, 49.9, 50, 79.9, 80, 100], ["#ef4444", "#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#10b981"]);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.5, // Animation rapide
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionValue]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={`${className} -rotate-90 overflow-visible`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        className="text-gray-200 dark:text-gray-700"
        fill="transparent"
        stroke="currentColor"
      />
      {/* Effet de lueur optionnel */}
      {glow && (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          stroke={color}
          strokeDasharray={circumference}
          strokeLinecap="round"
          style={{
            strokeDashoffset: strokeDashoffset,
            filter: 'blur(5px)',
            opacity: 0.8
          }}
        />
      )}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="transparent"
        stroke={color}
        strokeDasharray={circumference}
        strokeLinecap="round"
        style={{
          strokeDashoffset: strokeDashoffset,
        }}
      />
    </svg>
  );
};

export default CircularProgress;
