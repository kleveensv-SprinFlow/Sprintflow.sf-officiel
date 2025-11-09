import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

const ITEM_HEIGHT = 36; // en pixels
const VISIBLE_ITEMS = 5;

// --- Helper Functions pour générer les listes de temps ---
const generatePaddedArray = (length: number) => 
  Array.from({ length }, (_, i) => String(i).padStart(2, '0'));

const HOURS = generatePaddedArray(24);
const MINUTES = generatePaddedArray(60);
// ---------------------------------------------------------

interface WheelProps {
  values: (number | string)[];
  initialValue: number | string;
  onChange: (value: number | string) => void;
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
    // Si la liste de valeurs est vide, on ne fait rien
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

  // Si `values` est vide ou non défini, on n'affiche rien pour éviter le crash.
  if (!values || values.length === 0) {
    return <div className="h-48 w-32 relative" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }} />;
  }

  return (
    <div className="h-48 w-32 relative" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
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

interface PickerWheelProps {
    values?: (number | string)[]; // Rendu optionnel
    initialValue?: number | string; // Rendu optionnel pour type=time
    value?: string; // Ajouté pour le type="time"
    onChange: (value: any) => void;
    label?: string;
    suffix?: string;
    disabled?: boolean;
    type?: 'custom' | 'time'; // Ajout pour gérer les cas d'usage
}

const PickerWheel: React.FC<PickerWheelProps> = ({ 
    values: customValues, 
    initialValue,
    value,
    onChange, 
    label, 
    suffix, 
    disabled = false,
    type = 'custom'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Logique pour le type 'time'
    const isTimeType = type === 'time';
    const [time, setTime] = useState(value || '00:00');

    const [currentHour, currentMinute] = useMemo(() => 
      isTimeType ? time.split(':') : [null, null],
      [isTimeType, time]
    );

    // Détermine la valeur à afficher sur le bouton
    const displayValue = isTimeType ? value : initialValue;

    const handleSelectTime = (part: 'hour' | 'minute', val: string) => {
        const newTime = part === 'hour'
            ? `${val}:${currentMinute}`
            : `${currentHour}:${val}`;
        setTime(newTime);
    };

    const handleValidate = () => {
        if (isTimeType) {
            onChange(time);
        } else if (currentValue !== undefined) {
            onChange(currentValue);
        }
        setIsOpen(false);
    };

    // Logique pour le type 'custom'
    const [currentValue, setCurrentValue] = useState(initialValue);
    const values = customValues || [];

    const handleSelectCustom = (val: number | string) => {
        setCurrentValue(val);
    };

    const handleOpen = () => {
      if (disabled) return;
      if (isTimeType) {
        setTime(value || '00:00');
      } else {
        setCurrentValue(initialValue);
      }
      setIsOpen(true);
    };
    
    useEffect(() => {
        if (!isTimeType) {
            setCurrentValue(initialValue);
        }
    }, [initialValue, isTimeType]);

    return (
        <div className="flex flex-col items-center w-full">
            {label && <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
            <button
                type="button"
                onClick={handleOpen}
                disabled={disabled}
                className="w-full h-11 px-4 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-base font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {displayValue}{!isTimeType && suffix}
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
                            {isTimeType ? (
                                <div className="flex items-center gap-2">
                                    <Wheel values={HOURS} initialValue={currentHour} onChange={(v) => handleSelectTime('hour', v as string)} />
                                    <span className="text-2xl font-bold pb-4">:</span>
                                    <Wheel values={MINUTES} initialValue={currentMinute} onChange={(v) => handleSelectTime('minute', v as string)} />
                                </div>
                            ) : (
                                <Wheel values={values} initialValue={currentValue} onChange={handleSelectCustom} suffix={suffix} />
                            )}
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