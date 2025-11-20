import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Smile, Activity, Battery } from 'lucide-react';

interface StepWellnessProps {
  stress: number;
  setStress: (val: number) => void;
  fatigue: number;
  setFatigue: (val: number) => void;
  energy: number;
  setEnergy: (val: number) => void;
  mood: number;
  setMood: (val: number) => void;
}

interface WellnessSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon: React.ReactNode;
  gradient: string;
}

const WellnessSlider: React.FC<WellnessSliderProps> = ({ label, value, onChange, icon, gradient }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          {icon}
          <span className="font-medium text-sm">{label}</span>
        </div>
        <span className="font-bold text-lg">{value}/100</span>
      </div>
      <div className="relative h-10 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 bottom-0 ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {/* Ticks */}
        <div className="absolute inset-0 pointer-events-none flex justify-between px-1">
          {[0, 25, 50, 75, 100].map((tick) => (
            <div key={tick} className="h-full w-[1px] bg-white/20" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const StepWellness: React.FC<StepWellnessProps> = ({
  stress,
  setStress,
  fatigue,
  setFatigue,
  energy,
  setEnergy,
  mood,
  setMood
}) => {
  return (
    <div className="space-y-6 py-2">
      <WellnessSlider
        label="Énergie Subjective"
        value={energy}
        onChange={setEnergy}
        icon={<Zap size={18} className="text-yellow-500" />}
        gradient="bg-gradient-to-r from-yellow-500/50 to-yellow-500"
      />
      
      <WellnessSlider
        label="Humeur"
        value={mood}
        onChange={setMood}
        icon={<Smile size={18} className="text-blue-500" />}
        gradient="bg-gradient-to-r from-blue-500/50 to-blue-500"
      />
      
      <WellnessSlider
        label="Niveau de Stress"
        value={stress}
        onChange={setStress}
        icon={<Activity size={18} className="text-purple-500" />}
        gradient="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
      />
      
      <WellnessSlider
        label="Fatigue Musculaire"
        value={fatigue}
        onChange={setFatigue}
        icon={<Battery size={18} className="text-red-500" />}
        gradient="bg-gradient-to-r from-green-500 via-orange-500 to-red-500"
      />
    </div>
  );
};
