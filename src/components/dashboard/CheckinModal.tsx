import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckinWizard } from './checkin/CheckinWizard.tsx';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y > 200) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 h-full w-full bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#1F2937]/95 backdrop-blur-xl border-t border-white/20 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Drag Handle */}
        <div className="w-full pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing touch-none">
           <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600/50 rounded-full" />
        </div>
        
        {/* Wizard Content */}
        <div className="flex-grow overflow-hidden p-4 pt-0">
          <CheckinWizard onClose={onClose} onSuccess={onSuccess} />
        </div>
      </motion.div>
    </>
  );
};
