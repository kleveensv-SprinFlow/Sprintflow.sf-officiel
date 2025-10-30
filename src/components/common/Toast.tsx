import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, show, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Info className="w-5 h-5" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
