import React from 'react';
import { motion } from 'framer-motion';
import { Action } from '../../data/actions';

interface HubCardProps {
  action: Action;
  onClick: () => void;
}

const HubCard: React.FC<HubCardProps> = ({ action, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className="relative w-full h-full rounded-3xl overflow-hidden cursor-pointer bg-gray-700 shadow-lg"
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${action.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-6 text-white">
        <h2 className="text-3xl font-bold">{action.title}</h2>
        {action.subtitle && <p className="text-lg opacity-80">{action.subtitle}</p>}
      </div>
    </motion.div>
  );
};

export default HubCard;
