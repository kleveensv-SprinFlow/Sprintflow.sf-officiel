import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

interface WheelOption {
  value: number | string;
  label: string;
}

interface WheelProps {
  options: WheelOption[];
  value: number | string;
  onChange: (value: number | string) => void;
}

const Wheel: React.FC<WheelProps> = ({ options, value, onChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = useCallback((index: number, behavior: 'smooth' | 'auto' = 'smooth') => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ top: index * ITEM_HEIGHT, behavior });
    }
  }, []);

  useEffect(() => {
    const selectedIndex = options.findIndex(opt => opt.value === value);
    if (selectedIndex !== -1) {
      setTimeout(() => scrollToIndex(selectedIndex, 'auto'), 0);
    }
  }, [value, options, scrollToIndex]);

  const handleScroll = useCallback(
    debounce(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const centeredIndex = Math.round(container.scrollTop / ITEM_HEIGHT);
      const selectedOption = options[centeredIndex];
      if (selectedOption) {
        onChange(selectedOption.value);
      }
    }, 150),
    [options, onChange]
  );

  return (
    <div className="relative" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, width: '80px' }}>
      <div className="absolute top-1/2 left-0 right-0 h-9 bg-gray-200 dark:bg-gray-700/50 rounded-lg transform -translate-y-1/2 z-0" />
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto snap-y snap-mandatory no-scrollbar"
      >
        <div style={{ height: ITEM_HEIGHT * 2 }} />
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => scrollToIndex(options.findIndex(o => o.value === option.value))}
            className="h-9 flex items-center justify-center text-xl font-semibold select-none cursor-pointer snap-center"
          >
            {option.label}
          </div>
        ))}
        <div style={{ height: ITEM_HEIGHT * 2 }} />
      </div>
    </div>
  );
};

interface PickerWheelProps {
  options: WheelOption[];
  value: number | string;
  onChange: (value: any) => void;
  label?: string;
  disabled?: boolean;
}

export const PickerWheel: React.FC<PickerWheelProps> = ({ options = [], value, onChange, label, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find(opt => opt.value === value);

  const handleOpen = () => {
    if (disabled) return;
    setCurrentValue(value);
    setIsOpen(true);
  };

  const handleValidate = () => {
    onChange(currentValue);
    setIsOpen(false);
  };
  
  const displayLabel = selectedOption ? selectedOption.label : (safeOptions.find(o => o.value === 0)?.label || '0');

  return (
    <div className="flex flex-col items-center w-full">
      {label && <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="w-full h-11 px-4 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-base font-medium border border-gray-300 dark:border-gray-600"
      >
        {displayLabel}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center gap-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Wheel options={safeOptions} value={currentValue} onChange={setCurrentValue} />
              <button
                type="button"
                onClick={handleValidate}
                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg mt-2"
              >
                Valider
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PickerWheel;