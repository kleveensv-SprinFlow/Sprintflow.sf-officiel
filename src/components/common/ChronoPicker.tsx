// src/components/common/ChronoPicker.tsx
import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PickerWheel } from './PickerWheel'; // En supposant que PickerWheel est dans le même dossier

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

export const ChronoPicker: React.FC<ChronoPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const initialValues = useMemo(() => {
    const totalSeconds = value || 0;
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: Math.floor(totalSeconds % 60),
      centiseconds: Math.round((totalSeconds - Math.floor(totalSeconds)) * 100),
    };
  }, [value]);
  
  const [minutes, setMinutes] = useState(initialValues.minutes);
  const [seconds, setSeconds] = useState(initialValues.seconds);
  const [centiseconds, setCentiseconds] = useState(initialValues.centiseconds);

  const handleOpen = () => {
    const current = initialValues;
    setMinutes(current.minutes);
    setSeconds(current.seconds);
    setCentiseconds(current.centiseconds);
    setIsOpen(true);
  };

  const handleSave = () => {
    const newTotalSeconds = minutes * 60 + seconds + centiseconds / 100;
    onChange(newTotalSeconds);
    setIsOpen(false);
  };
  
  const minutesOptions = Array.from({ length: 60 }, (_, i) => ({ value: i, label: `${i}m` }));
  const secondsOptions = Array.from({ length: 60 }, (_, i) => ({ value: i, label: `${i}s` }));
  const centisecondsOptions = Array.from({ length: 100 }, (_, i) => ({ value: i, label: `.${String(i).padStart(2, '0')}` }));

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
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[90%] max-w-sm p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-center mb-6">Saisir le temps</h3>
              <div className="flex justify-center items-center gap-2">
                <PickerWheel options={minutesOptions} value={minutes} onChange={setMinutes} />
                <PickerWheel options={secondsOptions} value={seconds} onChange={setSeconds} />
                <PickerWheel options={centisecondsOptions} value={centiseconds} onChange={setCentiseconds} />
              </div>
              <div className="mt-8 flex gap-4">
                <button type="button" onClick={() => setIsOpen(false)} className="w-full py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold">Annuler</button>
                <button type="button" onClick={handleSave} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold">Valider</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
