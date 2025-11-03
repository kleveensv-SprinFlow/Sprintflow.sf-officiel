import React, { useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

interface PickerWheelProps {
  values: number[];
  initialValue: number;
  onChange: (value: number) => void;
  label?: string;
  suffix?: string;
}

const PickerWheel: React.FC<PickerWheelProps> = ({ values, initialValue, onChange, label, suffix }) => {
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
    <div className="flex flex-col items-center">
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
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
    </div>
  );
};

export default PickerWheel;