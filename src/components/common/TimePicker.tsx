import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const ITEM_HEIGHT = 40; // Hauteur de chaque élément en pixels
const VISIBLE_ITEMS = 3; // Nombre d'éléments visibles

interface WheelProps {
  values: number[];
  initialValue: number;
  onChange: (value: number) => void;
}

const Wheel: React.FC<WheelProps> = ({ values, initialValue, onChange }) => {
  const y = useMotionValue(-values.indexOf(initialValue) * ITEM_HEIGHT);
  
  const handleDragEnd = (event: any, info: any) => {
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
      className="h-40 w-20 overflow-hidden relative touch-none"
      style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
    >
      <div className="absolute top-1/2 left-0 right-0 h-10 bg-gray-200 dark:bg-gray-700/50 rounded-lg transform -translate-y-1/2 z-0" />
      <motion.div
            drag="y"
            dragConstraints={{
              top: -ITEM_HEIGHT * (values.length - 1),
              bottom: 0,
            }}
            onDragEnd={handleDragEnd}
            style={{ y, paddingTop: ITEM_HEIGHT, paddingBottom: ITEM_HEIGHT }}
            className="flex flex-col items-center z-10"
      >
        {values.map((val) => (
          <div
            key={val}
            className="h-10 w-full flex items-center justify-center text-xl font-semibold select-none"
            style={{ height: ITEM_HEIGHT }}
          >
            {val.toString().padStart(2, '0')}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

interface TimePickerProps {
    initialTime: string; // "MM:SS"
    onChange: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ initialTime, onChange }) => {
    const parseTime = (time: string) => {
        const [min, sec] = time.split(':').map(Number);
        return { min, sec };
    };

    const [minutes, setMinutes] = useState(parseTime(initialTime).min);
    const [seconds, setSeconds] = useState(parseTime(initialTime).sec);

    const minutesValues = Array.from({ length: 31 }, (_, i) => i);
    const secondsValues = Array.from({ length: 60 }, (_, i) => i);

    useEffect(() => {
        const newTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        onChange(newTime);
    }, [minutes, seconds, onChange]);

    return (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900/50 p-2 rounded-xl">
            <Wheel values={minutesValues} initialValue={minutes} onChange={setMinutes} />
            <span className="text-2xl font-semibold pb-1">:</span>
            <Wheel values={secondsValues} initialValue={seconds} onChange={setSeconds} />
        </div>
    );
};

export default TimePicker;