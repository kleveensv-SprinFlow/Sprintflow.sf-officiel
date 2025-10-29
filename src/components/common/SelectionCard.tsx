import React from 'react';
import { motion } from 'framer-motion';

interface SelectionCardProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ label, isSelected, onClick, icon }) => {
  return (
    <motion.div
      onClick={onClick}
      className="cursor-pointer p-4 border rounded-lg flex flex-col items-center justify-center text-center transition-all duration-300"
      animate={{
        scale: isSelected ? 1.05 : 1,
        opacity: isSelected ? 1 : 0.7,
        borderColor: isSelected ? 'rgba(251, 146, 60, 0.7)' : 'rgba(255, 255, 255, 0.3)',
        boxShadow: isSelected ? '0 0 15px rgba(251, 146, 60, 0.3)' : '0 0 0px rgba(0,0,0,0)',
      }}
      whileHover={{ scale: 1.05, opacity: 1 }}
    >
      {icon && <div className="mb-2">{icon}</div>}
      <span className="font-semibold text-white">{label}</span>
    </motion.div>
  );
};