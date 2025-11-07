import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DistanceSelectorProps {
  initialValue: number;
  onChange: (value: number) => void;
}

const defaultDistances = [100, 200, 400, 800];
const STORAGE_KEY = 'sprintflow_custom_distances';

const DistanceSelector: React.FC<DistanceSelectorProps> = ({ initialValue, onChange }) => {
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const [customDistances, setCustomDistances] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCustomDistances(JSON.parse(stored));
    }
  }, []);

  const handleSelect = (value: number | 'Autre...') => {
    if (value === 'Autre...') {
      setCustomValue('');
      setIsModalOpen(true);
    } else {
      setSelectedValue(value);
      onChange(value);
    }
  };

  const handleSaveCustom = () => {
    const numValue = parseInt(customValue, 10);
    if (!isNaN(numValue) && numValue > 0) {
      if (!customDistances.includes(numValue) && !defaultDistances.includes(numValue)) {
        const updatedCustom = [...customDistances, numValue].sort((a, b) => a - b);
        setCustomDistances(updatedCustom);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustom));
      }
      setSelectedValue(numValue);
      onChange(numValue);
      setIsModalOpen(false);
    }
  };

  const allDistances = [...defaultDistances, ...customDistances].sort((a, b) => a - b);
  const isCustom = !allDistances.includes(selectedValue);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance</label>
      <div className="flex flex-wrap gap-2">
        {allDistances.map((dist) => (
          <button
            key={dist}
            type="button"
            onClick={() => handleSelect(dist)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
              selectedValue === dist ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            {dist}m
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleSelect('Autre...')}
          className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
            isModalOpen || isCustom ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          {isCustom ? `${selectedValue}m` : 'Autre...'}
        </button>
      </div>
      <AnimatePresence>
        {isModalOpen && (
           <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center gap-4 w-64"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-bold">Distance personnalisée</h4>
              <div className="relative">
                <input
                  type="number"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="w-full h-12 text-center text-xl font-bold bg-gray-100 dark:bg-gray-700 rounded-lg"
                  pattern="\d*"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">m</span>
              </div>
              <button onClick={handleSaveCustom} className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg">
                Valider
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DistanceSelector;