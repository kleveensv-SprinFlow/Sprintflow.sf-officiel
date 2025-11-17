
import React from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';

interface SprintyChatHeaderProps {
  onMenuClick: () => void;
}

const SprintyChatHeader: React.FC<SprintyChatHeaderProps> = ({ onMenuClick }) => {
  const { profile } = useAuth();
  const photoUrl = profile?.photo_url;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between p-4"
    >
      <button onClick={onMenuClick} className="p-2">
        <Menu size={24} />
      </button>
      
      <div className="w-10 h-10 rounded-full bg-light-card dark:bg-dark-card overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt="Profil" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-600" />
        )}
      </div>
    </motion.div>
  );
};

export default SprintyChatHeader;
