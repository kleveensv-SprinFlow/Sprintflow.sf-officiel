import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Choice {
  label: string;
  action: () => void;
  style?: 'primary' | 'default';
}

interface ChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  choices: Choice[];
  title: string;
}

export const ChoiceModal: React.FC<ChoiceModalProps> = ({ isOpen, onClose, choices, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                {choices.map((choice, index) => {
                  const isPrimary = choice.style === 'primary';
                  const buttonClasses = isPrimary
                    ? "w-full text-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold"
                    : "w-full text-center px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-semibold";
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        choice.action();
                        onClose();
                      }}
                      className={buttonClasses}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};