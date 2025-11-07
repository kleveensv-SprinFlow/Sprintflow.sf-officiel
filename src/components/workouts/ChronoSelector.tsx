import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChronoSelectorProps {
  initialValue: number | null;
  onChange: (value: number) => void;
  onClose: () => void;
}

const defaultChronos = [10.5, 11.0, 11.5, 22.0, 23.0, 24.0, 50.0, 52.0, 55.0];
const STORAGE_KEY = 'sprintflow_custom_chronos';

const formatChrono = (value: number | null) => {
  if (value === null) return '00.00';
  return value.toFixed(2);
};

export const ChronoSelector: React.FC<ChronoSelectorProps> = ({ initialValue, onChange, onClose }) => {
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const [customChronos, setCustomChronos] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCustomChronos(JSON.parse(stored));
    }
  }, []);

  const handleSelect = (value: number | 'Autre...') => {
    if (value === 'Autre...') {
      setCustomValue('');
      setIsModalOpen(true);
    } else {
      setSelectedValue(value);
      onChange(value);
      onClose();
    }
  };

  const handleSaveCustom = () => {
    const numValue = parseFloat(customValue);
    if (!isNaN(numValue) && numValue > 0) {
      if (!customChronos.includes(numValue) && !defaultChronos.includes(numValue)) {
        const updatedCustom = [...customChronos, numValue].sort((a, b) => a - b);
        setCustomChronos(updatedCustom);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustom));
      }
      handleSelect(numValue);
    }
  };

  const allChronos = [...defaultChronos, ...customChronos].sort((a, b) => a - b);
  
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg w-full max-w-sm m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4">Sélectionner un chrono</h3>
        <div className="flex flex-wrap gap-2">
          {allChronos.map((chrono) => (
            <button
              key={chrono}
              type="button"
              onClick={() => handleSelect(chrono)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                selectedValue === chrono ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {formatChrono(chrono)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSelect('Autre...')}
            className="px-3 py-1.5 text-sm font-semibold rounded-full transition-colors bg-gray-200 dark:bg-gray-700"
          >
            Autre...
          </button>
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="bg-gray-100 dark:bg-gray-900 rounded-xl p-6 flex flex-col items-center gap-4 w-64"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="font-bold">Chrono personnalisé</h4>
                <input
                  type="number"
                  step="0.01"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="w-full h-12 text-center text-xl font-bold bg-white dark:bg-gray-700 rounded-lg"
                  pattern="\d*\.?\d*"
                  autoFocus
                  placeholder="SS.cc"
                />
                <button onClick={handleSaveCustom} className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg">
                  Valider
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};