import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PickerWheel from './PickerWheel';

interface ChronoPickerProps {
  value: number | null; // en secondes
  onChange: (newSeconds: number) => void;
}

// Helper pour formater le temps
const formatChrono = (totalSeconds: number | null): string => {
  if (totalSeconds === null || totalSeconds < 0) {
    return '--:--.--';
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const centiseconds = Math.round((totalSeconds - Math.floor(totalSeconds)) * 100);

  if (minutes > 0) {
    return `${String(minutes).padStart(1, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  }
  return `${String(seconds).padStart(1, '0')}.${String(centiseconds).padStart(2, '0')}`;
};

const ChronoPicker: React.FC<ChronoPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const minutesOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ value: i, label: `${i}m` })), []);
  const secondsOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ value: i, label: `${i}s` })), []);
  const centisecondsOptions = useMemo(() => Array.from({ length: 100 }, (_, i) => ({ value: i, label: `.${String(i).padStart(2, '0')}` })), []);

  const handleValidate = (minutes: number, seconds: number, centiseconds: number) => {
    onChange(minutes * 60 + seconds + centiseconds / 100);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full text-center px-4 py-2 text-lg font-mono bg-gray-200 dark:bg-gray-700 rounded-lg"
      >
        {formatChrono(value)}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[90%] max-w-sm p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-center mb-6">Saisir le temps</h3>
              <div className="flex justify-center items-center gap-2">
                <PickerWheel options={minutesOptions} value={Math.floor(value! / 60)} onChange={(val) => handleValidate(val, Math.floor(value! % 60), Math.round((value! - Math.floor(value!)) * 100))} />
                <PickerWheel options={secondsOptions} value={Math.floor(value! % 60)} onChange={(val) => handleValidate(Math.floor(value! / 60), val, Math.round((value! - Math.floor(value!)) * 100))} />
                <PickerWheel options={centisecondsOptions} value={Math.round((value! - Math.floor(value!)) * 100)} onChange={(val) => handleValidate(Math.floor(value! / 60), Math.floor(value! % 60), val)} />
              </div>
              <div className="mt-8 flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleValidate(Math.floor(value! / 60), Math.floor(value! % 60), Math.round((value! - Math.floor(value!)) * 100))}
                  className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg"
                >
                  Valider
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChronoPicker;