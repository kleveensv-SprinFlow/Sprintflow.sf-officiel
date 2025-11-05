import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PickerWheel from './PickerWheel';

interface TimePickerProps {
  initialTime: string; // "MM:SS"
  onChange: (time: string) => void;
}

const minutesValues = Array.from({ length: 60 }, (_, i) => i);
const secondsValues = Array.from({ length: 60 }, (_, i) => i);

const TimePicker: React.FC<TimePickerProps> = ({ initialTime, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const parseTime = (time: string) => {
    const parts = time.split(':');
    if (parts.length === 2) {
        const [min, sec] = parts.map(Number);
        if (!isNaN(min) && !isNaN(sec)) return { min, sec };
    }
    return { min: 0, sec: 0 };
  };

  const [minutes, setMinutes] = useState(parseTime(initialTime).min);
  const [seconds, setSeconds] = useState(parseTime(initialTime).sec);

  const handleValidate = () => {
    const newTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    onChange(newTime);
    setIsOpen(false);
  };

  const handleOpen = () => {
    const { min, sec } = parseTime(initialTime);
    setMinutes(min);
    setSeconds(sec);
    setIsOpen(true);
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleOpen}
        className="w-full h-11 px-4 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-base font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-shadow"
      >
        {initialTime}
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
              <div className="flex items-start gap-2">
                <PickerWheel values={minutesValues} initialValue={minutes} onChange={setMinutes} label="Min" />
                <PickerWheel values={secondsValues} initialValue={seconds} onChange={setSeconds} label="Sec" />
              </div>
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

export default TimePicker;