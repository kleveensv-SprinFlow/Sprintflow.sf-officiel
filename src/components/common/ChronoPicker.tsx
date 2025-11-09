import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

// --- Constants and Helpers ---
const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

const generatePaddedArray = (length: number) => 
  Array.from({ length }, (_, i) => String(i).padStart(2, '0'));

const MINUTES_VALUES = generatePaddedArray(60);
const SECONDS_VALUES = generatePaddedArray(60);
const CENTISECONDS_VALUES = generatePaddedArray(100);

// --- Reusable Wheel Component (from PickerWheel) ---
interface WheelProps {
  values: string[];
  initialValue: string;
  onChange: (value: string) => void;
  suffix?: string;
}

const Wheel: React.FC<WheelProps> = ({ values, initialValue, onChange, suffix }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollToIndex = useCallback((index: number, behavior: 'smooth' | 'auto' = 'smooth') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollTop = index * ITEM_HEIGHT;
      container.scrollTo({ top: scrollTop, behavior });
    }
  }, []);

  useEffect(() => {
    if (values.length === 0) return;
    const initialIndex = values.findIndex(v => v === initialValue);
    if (initialIndex !== -1) {
      setTimeout(() => scrollToIndex(initialIndex, 'auto'), 0);
    }
  }, [initialValue, values, scrollToIndex]);
  
  const handleScroll = useCallback(
    debounce(() => {
      const container = scrollContainerRef.current;
      if (!container || values.length === 0) return;
      
      const centeredIndex = Math.round(container.scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(values.length - 1, centeredIndex));
      
      const selectedValue = values[clampedIndex];
      if (selectedValue !== undefined) {
        onChange(selectedValue);
      }
    }, 150),
    [values, onChange]
  );

  if (!values || values.length === 0) {
    return <div className="h-48 w-24 relative" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }} />;
  }

  return (
    <div className="h-48 w-24 relative" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
      <div className="absolute top-1/2 left-0 right-0 h-9 bg-gray-200 dark:bg-gray-700/50 rounded-lg transform -translate-y-1/2 z-0 pointer-events-none" />
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto snap-y snap-mandatory no-scrollbar"
      >
        <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
        {values.map((val, index) => (
          <div
            key={index}
            onClick={() => scrollToIndex(index)}
            className="h-9 w-full flex items-center justify-center text-xl font-semibold select-none cursor-pointer snap-center text-gray-900 dark:text-white"
            style={{ height: ITEM_HEIGHT }}
          >
            {val}{suffix}
          </div>
        ))}
        <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
      </div>
    </div>
  );
};

// --- Main ChronoPicker Component ---
interface ChronoPickerProps {
  initialValue: number | null; // in seconds, e.g., 75.43
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
}

const formatChrono = (totalSeconds: number | null): string => {
  if (totalSeconds === null || totalSeconds === undefined) return '00:00,00';
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
  const centiseconds = String(Math.round((totalSeconds - Math.floor(totalSeconds)) * 100)).padStart(2, '0');
  return `${minutes}:${seconds},${centiseconds}`;
};

export const ChronoPicker: React.FC<ChronoPickerProps> = ({ initialValue, onChange, label, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const [centiseconds, setCentiseconds] = useState('00');
  
  const displayValue = useMemo(() => formatChrono(initialValue), [initialValue]);

  const setTimeFromTotalSeconds = (totalSeconds: number | null) => {
    const val = totalSeconds || 0;
    setMinutes(String(Math.floor(val / 60)).padStart(2, '0'));
    setSeconds(String(Math.floor(val % 60)).padStart(2, '0'));
    setCentiseconds(String(Math.round((val - Math.floor(val)) * 100)).padStart(2, '0'));
  };

  const handleOpen = () => {
    if (disabled) return;
    setTimeFromTotalSeconds(initialValue);
    setIsOpen(true);
  };

  const handleValidate = () => {
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(centiseconds) / 100;
    onChange(totalSeconds);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {label && <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="w-full h-11 px-4 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-base font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {displayValue}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1">
                <Wheel values={MINUTES_VALUES} initialValue={minutes} onChange={setMinutes} />
                <span className="text-2xl font-bold pb-4">:</span>
                <Wheel values={SECONDS_VALUES} initialValue={seconds} onChange={setSeconds} />
                <span className="text-2xl font-bold pb-4">,</span>
                <Wheel values={CENTISECONDS_VALUES} initialValue={centiseconds} onChange={setCentiseconds} />
              </div>
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