import React from 'react';
import PickerWheel from '../../../common/PickerWheel.tsx';
import SleepDurationGauge from '../../../sleep/SleepDurationGauge.tsx';
import { motion } from 'framer-motion';

interface StepSleepProps {
  bedtime: string;
  setBedtime: (val: string) => void;
  wakeupTime: string;
  setWakeupTime: (val: string) => void;
  sleepDuration: number;
  sleepQuality: number;
  setSleepQuality: (val: number) => void;
}

export const StepSleep: React.FC<StepSleepProps> = ({
  bedtime,
  setBedtime,
  wakeupTime,
  setWakeupTime,
  sleepDuration,
  sleepQuality,
  setSleepQuality
}) => {
  
  // Helper for sleep quality description
  const getQualityLabel = (val: number) => {
    if (val >= 80) return "Excellent";
    if (val >= 60) return "Bon";
    if (val >= 40) return "Moyen";
    if (val >= 20) return "Agité";
    return "Mauvais";
  };

  // Helper for quality color
  const getQualityColor = (val: number) => {
    if (val >= 80) return "text-green-500";
    if (val >= 60) return "text-emerald-500";
    if (val >= 40) return "text-yellow-500";
    if (val >= 20) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-8">
      
      {/* Time Pickers */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/5 dark:bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
          <PickerWheel label="Coucher" value={bedtime} onChange={setBedtime} type="time" />
        </div>
        <div className="bg-white/5 dark:bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
          <PickerWheel label="Lever" value={wakeupTime} onChange={setWakeupTime} type="time" />
        </div>
      </div>

      {/* Duration Gauge */}
      <div className="flex justify-center">
        <SleepDurationGauge sleepDuration={sleepDuration} />
      </div>

      {/* Quality Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-end px-2">
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qualité du sommeil</label>
          <span className={`text-lg font-bold ${getQualityColor(sleepQuality)}`}>{getQualityLabel(sleepQuality)}</span>
        </div>
        
        <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 relative touch-none">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={sleepQuality}
            onChange={(e) => setSleepQuality(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
          />
          <div className="w-full h-full rounded-xl overflow-hidden relative bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 opacity-20" />
          <motion.div 
             className="absolute top-1 bottom-1 w-10 h-10 bg-white dark:bg-slate-700 rounded-xl shadow-md flex items-center justify-center z-10 pointer-events-none border border-gray-200 dark:border-gray-600"
             style={{ left: `calc(${sleepQuality}% - 20px)` }}
          >
            <span className="text-xs font-bold">{sleepQuality}</span>
          </motion.div>
        </div>
      </div>

    </div>
  );
};
