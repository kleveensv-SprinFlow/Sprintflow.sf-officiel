import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Check } from 'lucide-react';

interface CustomNumpadProps {
  isOpen: boolean;
  onClose: () => void;
  onInput: (value: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
  currentValue: string;
}

const NumpadButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center h-14 rounded-lg bg-gray-200/50 dark:bg-gray-800/50 text-2xl font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${className}`}
  >
    {children}
  </button>
);

const CustomNumpad: React.FC<CustomNumpadProps> = ({ isOpen, onClose, onInput, onDelete, onConfirm, currentValue }) => {
  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="relative p-4 bg-white dark:bg-gray-900 shadow-lg rounded-t-2xl pb-24" // pb-24 for TabBar clearance
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Saisir une valeur</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            
            <div className="text-center text-3xl font-bold p-2 mb-4 border-b-2 border-indigo-500 text-gray-900 dark:text-white">
              {currentValue || '0'}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {buttons.map(btn => (
                <NumpadButton key={btn} onClick={() => onInput(btn)}>
                  {btn}
                </NumpadButton>
              ))}
              <NumpadButton onClick={onDelete} className="bg-red-500/20 text-red-500 dark:bg-red-500/30 dark:text-red-400">
                <ArrowLeft size={24} />
              </NumpadButton>
            </div>
            
            <button
              onClick={onConfirm}
              className="w-full mt-4 h-16 flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg text-xl font-bold hover:bg-green-700 transition-colors"
            >
              <Check size={24} /> Valider
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomNumpad;