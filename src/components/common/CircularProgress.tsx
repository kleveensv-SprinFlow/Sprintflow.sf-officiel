import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface CircularProgressProps {
  value: number; // 0-100
  strokeWidth?: number;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value, strokeWidth = 10, className }) => {
  const size = 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const motionValue = useMotionValue(0);
  
  const strokeDashoffset = useTransform(motionValue, [0, 100], [circumference, 0]);
  const color = useTransform(motionValue, [0, 50, 100], ["#FF5733", "#FFC300", "#66DE93"]); // Red -> Yellow -> Green

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.5,
      delay: 0.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionValue]);

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