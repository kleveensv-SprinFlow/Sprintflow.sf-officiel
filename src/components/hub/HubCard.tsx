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
      // Ajout de shadow-xl pour plus de profondeur
      className="relative w-full h-full rounded-3xl overflow-hidden cursor-pointer bg-gray-900 shadow-xl"
      whileTap={{ scale: 0.98 }}
    >
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
        style={{ backgroundImage: `url(${action.image})` }}
      />
      
      {/* Dégradé AMÉLIORÉ pour le style GOWOD : 
         Plus sombre en bas (from-black/90) pour que le texte ressorte parfaitement 
         sur une grande image.
      */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Contenu textuel */}
      <div className="relative h-full flex flex-col justify-end p-8 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-1 leading-tight">{action.title}</h2>
        {action.subtitle && (
          <p className="text-lg opacity-90 font-medium text-gray-200">{action.subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};

export default HubCard;