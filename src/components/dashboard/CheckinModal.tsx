import React from 'react';
import { motion } from 'framer-motion';
import { WellnessCheckinCard } from './WellnessCheckinCard.tsx';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y > 200) {
      onClose();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 h-full bg-black/50 backdrop-blur-sm z-40"
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        className="fixed bottom-0 left-0 right-0 z-50 bg-light-card dark:bg-dark-card rounded-t-2xl max-h-[95vh] flex flex-col"
      >
        <div className="w-16 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto my-3 cursor-grab active:cursor-grabbing flex-shrink-0" />
        <div className="flex-grow overflow-hidden">
          <WellnessCheckinCard onClose={onClose} onSuccess={onSuccess} />
        </div>
      </motion.div>
    </>
  );
};
