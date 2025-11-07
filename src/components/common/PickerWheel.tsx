import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

const ITEM_HEIGHT = 36; // en pixels
const VISIBLE_ITEMS = 5;

interface WheelProps {
  values: (number | string)[];
  initialValue: number | string;
  onChange: (value: number | string) => void;
  suffix?: string;
}

const Wheel: React.FC<WheelProps> = ({ values, initialValue, onChange, suffix }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Fait défiler un élément au centre de la vue
  const scrollToIndex = useCallback((index: number, behavior: 'smooth' | 'auto' = 'smooth') => {
    const container = scrollContainerRef.current;
    if (container) {
        const scrollTop = index * ITEM_HEIGHT;
        container.scrollTo({ top: scrollTop, behavior });
    }
  }, []);

  // Positionne la roulette sur la valeur initiale lors du chargement
  useEffect(() => {
    const initialIndex = values.findIndex(v => v === initialValue);
    if (initialIndex !== -1) {
      // Use a timeout to ensure the element is visible before scrolling
      setTimeout(() => scrollToIndex(initialIndex, 'auto'), 0);
    }
  }, [initialValue, values, scrollToIndex]);
  
  // Gère la détection de la valeur au centre après un défilement
  const handleScroll = useCallback(
    debounce(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const centeredIndex = Math.round(container.scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(values.length - 1, centeredIndex));
      
      const selectedValue = values[clampedIndex];
      if (selectedValue !== undefined) {
        onChange(selectedValue);
      }
    }, 150), // debounce pour éviter les appels excessifs
    [values, onChange]
  );

  return (
    <div className="h-48 w-32 relative" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
        {/* Indicateur de sélection au centre */}
        <div className="absolute top-1/2 left-0 right-0 h-9 bg-gray-200 dark:bg-gray-700/50 rounded-lg transform -translate-y-1/2 z-0 pointer-events-none" />

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto snap-y snap-mandatory no-scrollbar"
        >
          {/* Padding pour centrer le premier et dernier élément */}
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
          
          {/* Padding pour centrer le premier et dernier élément */}
          <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
        </div>
    </div>
  );
};

interface PickerWheelProps {
    values: (number | string)[];
    initialValue: number | string;
    onChange: (value: any) => void;
    label?: string;
    suffix?: string;
    disabled?: boolean;
}

const PickerWheel: React.FC<PickerWheelProps> = ({ values, initialValue, onChange, label, suffix, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentValue, setCurrentValue] = useState(initialValue);

    const handleSelect = (value: number | string) => {
        setCurrentValue(value);
    };

    const handleValidate = () => {
        onChange(currentValue);
        setIsOpen(false);
    };

    const handleOpen = () => {
      if (disabled) return;
      setCurrentValue(initialValue);
      setIsOpen(true);
    };
    
    // S'assure que la valeur affichée sur le bouton est toujours à jour
    useEffect(() => {
        setCurrentValue(initialValue);
    }, [initialValue]);

    return (
        <div className="flex flex-col items-center w-full">
            {label && <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
            <button
                type="button"
                onClick={handleOpen}
                disabled={disabled}
                className="w-full h-11 px-4 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-base font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {initialValue}{suffix}
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
                            <Wheel values={values} initialValue={currentValue} onChange={handleSelect} suffix={suffix} />
                            <button
                                type="button"
                                onClick={handleValidate}
                                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg"
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