import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimePicker from './TimePicker';

interface RestTimeSelectorProps {
  initialTime: string; // format "MM:SS"
  onChange: (time: string) => void;
}

const defaultTimes = ['00:30', '01:00', '01:30', '02:00', '03:00'];
const STORAGE_KEY = 'sprintflow_custom_rest_times';

const RestTimeSelector: React.FC<RestTimeSelectorProps> = ({ initialTime, onChange }) => {
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [customTimes, setCustomTimes] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customTimeValue, setCustomTimeValue] = useState("01:00");

  useEffect(() => {
    const storedTimes = localStorage.getItem(STORAGE_KEY);
    if (storedTimes) {
      setCustomTimes(JSON.parse(storedTimes));
    }
  }, []);

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    onChange(time);
    if (time === 'Autre...') {
      setIsModalOpen(true);
    }
  };

  const handleSaveCustomTime = () => {
    if (!customTimes.includes(customTimeValue) && !defaultTimes.includes(customTimeValue)) {
      const updatedCustomTimes = [...customTimes, customTimeValue].sort();
      setCustomTimes(updatedCustomTimes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomTimes));
    }
    handleSelectTime(customTimeValue);
    setIsModalOpen(false);
  };

  const allPresetTimes = [...defaultTimes, ...customTimes].sort();
  const isCustom = !allPresetTimes.includes(selectedTime) && selectedTime !== 'Autre...';

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {allPresetTimes.map((time) => (
          <button
            key={time}
            type="button"
            onClick={() => handleSelectTime(time)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
              selectedTime === time ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            {time.replace(/^0/, '')}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleSelectTime('Autre...')}
          className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
            isModalOpen || isCustom ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          {isCustom ? selectedTime.replace(/^0/, '') : 'Autre...'}
        </button>
      </div>
      <AnimatePresence>
        {isModalOpen && (
           <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-bold">Temps de repos personnalisé</h4>
              <TimePicker initialTime={customTimeValue} onChange={setCustomTimeValue} />
              <button onClick={handleSaveCustomTime} className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg">
                Valider
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RestTimeSelector;