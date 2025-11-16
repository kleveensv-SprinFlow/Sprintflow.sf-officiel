import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  leftText?: string;
  rightText?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle, leftText = 'Simple', rightText = 'Expert' }) => {
  return (
    <div
      className="flex w-32 cursor-pointer items-center justify-between rounded-full bg-sprint-light-surface p-1 dark:bg-sprint-dark-surface"
      onClick={onToggle}
    >
      <span className={`z-10 w-1/2 text-center text-xs font-semibold ${!isOn ? 'text-white' : 'text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary'}`}>
        {leftText}
      </span>
      <span className={`z-10 w-1/2 text-center text-xs font-semibold ${isOn ? 'text-white' : 'text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary'}`}>
        {rightText}
      </span>
      <motion.div
        className="absolute h-6 w-16 rounded-full bg-sprint-accent"
        layout
        initial={false}
        animate={{ x: isOn ? '100%' : '0%' }}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      />
    </div>
  );
};

export default ToggleSwitch;
