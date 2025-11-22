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
      {/* Highlight Box */}
      <div className="absolute top-1/2 left-0 right-0 h-9 bg-gray-100 dark:bg-white/20 rounded-lg transform -translate-y-1/2 z-0 border border-primary/30" />
      
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
            className={`h-9 flex items-center justify-center text-xl font-semibold select-none cursor-pointer snap-center transition-colors duration-200 ${
                option.value === value 
                  ? 'text-primary dark:text-white scale-110' 
                  : 'text-gray-500 dark:text-gray-400 opacity-60'
              }`}
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
  options?: WheelOption[];
  value: number | string;
  onChange: (value: any) => void;
  label?: string;
  type?: 'number' | 'time';
  disabled?: boolean;
}

export const PickerWheel: React.FC<PickerWheelProps> = ({ options, value, onChange, label, type = 'number', disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const safeOptions = React.useMemo(() => {
      if (options) return options;
      if (type === 'time') {
          const timeOptions = [];
          for (let h = 0; h < 24; h++) {
              for (let m = 0; m < 60; m += 15) {
                  const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                  timeOptions.push({ value: time, label: time });
              }
          }
          return timeOptions;
      }
      return Array.from({ length: 101 }, (_, i) => ({ value: i, label: i.toString() }));
  }, [options, type]);

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

  const displayLabel = selectedOption ? selectedOption.label : value.toString();

  return (
    <div className="flex flex-col items-center w-full">
      {label && <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="w-full h-14 px-4 bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl font-bold border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white shadow-sm active:scale-95 transition-transform"
      >
        {displayLabel}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white dark:bg-[#1F2937] w-full sm:w-auto sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl flex flex-col items-center gap-6 border-t border-white/10 sm:border-none"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center w-full mb-2 sm:hidden">
                 <span className="text-lg font-bold text-gray-900 dark:text-white">{label || 'Sélectionner'}</span>
                 <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400">Annuler</button>
              </div>
              
              <Wheel options={safeOptions} value={currentValue} onChange={setCurrentValue} />
              
              <button
                type="button"
                onClick={handleValidate}
                className="w-full py-4 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/30"
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
