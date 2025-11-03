import React, { useState, useRef } from 'react';
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

interface WheelProps {
  values: number[];
  initialValue: number;
  onChange: (value: number) => void;
  suffix?: string;
}

const Wheel: React.FC<WheelProps> = ({ values, initialValue, onChange, suffix }) => {
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const initialIndex = values.indexOf(initialValue);
    if (initialIndex !== -1) {
      y.set(-initialIndex * ITEM_HEIGHT);
    }
  }, [initialValue, values, y]);

  const handleDragEnd = (event: any, info: any) => {
    const container = containerRef.current;
    if (!container) return;

    const offset = info.offset.y;
    const nearestIndex = Math.round((y.get() + offset) / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(values.length - 1, -nearestIndex));
    
    const targetY = -clampedIndex * ITEM_HEIGHT;

    animate(y, targetY, {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      onComplete: () => {
        onChange(values[clampedIndex]);
      }
    });
  };
  
  return (
    <div
        ref={containerRef}
        className="h-48 w-32 overflow-hidden relative touch-none rounded-lg bg-gray-100 dark:bg-gray-900/50"
        style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
    >
        <div className="absolute top-1/2 left-0 right-0 h-9 bg-gray-200 dark:bg-gray-700/50 rounded-lg transform -translate-y-1/2 z-0" />
        <motion.div
            drag="y"
            dragConstraints={{
                top: -ITEM_HEIGHT * (values.length - 1),
                bottom: 0,
            }}
            onDragEnd={handleDragEnd}
            style={{ y, paddingTop: ITEM_HEIGHT * 2, paddingBottom: ITEM_HEIGHT * 2 }}
            className="flex flex-col items-center z-10"
        >
            {values.map((val) => (
            <div
                key={val}
                className="h-9 w-full flex items-center justify-center text-xl font-semibold select-none text-gray-900 dark:text-white"
                style={{ height: ITEM_HEIGHT }}
            >
                {val}{suffix}
            </div>
            ))}
        </motion.div>
    </div>
  );
};

interface PickerWheelProps {
    values: number[];
    initialValue: number;
    onChange: (value: number) => void;
    label?: string;
    suffix?: string;
}

const PickerWheel: React.FC<PickerWheelProps> = ({ values, initialValue, onChange, label, suffix }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentValue, setCurrentValue] = useState(initialValue);

    const handleSelect = (value: number) => {
        setCurrentValue(value);
    };

    const handleValidate = () => {
        onChange(currentValue);
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col items-center">
            {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-32 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-xl font-semibold !text-black dark:!text-white border border-gray-300 dark:border-gray-600"
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