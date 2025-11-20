import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Moon, Zap, Activity } from 'lucide-react';

interface StepSummaryProps {
  sleepDuration: number;
  sleepQuality: number;
  energy: number;
  mood: number;
  stress: number;
  fatigue: number;
  menstruations: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const StepSummary: React.FC<StepSummaryProps> = ({
  sleepDuration,
  sleepQuality,
  energy,
  mood,
  stress,
  fatigue,
  menstruations,
  onSubmit,
  isSubmitting
}) => {

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m > 0 ? m : ''}`;
  };

  const SummaryItem = ({ label, value, icon, color }: any) => (
    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-white dark:bg-white/10 ${color}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
      </div>
      <span className="font-bold text-gray-900 dark:text-white">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3">
        <SummaryItem 
          label="Sommeil" 
          value={`${formatDuration(sleepDuration)} • ${sleepQuality}/100`}
          icon={<Moon size={16} />}
          color="text-blue-500"
        />
        <SummaryItem 
          label="Énergie & Humeur" 
          value={`${energy}/100 • ${mood}/100`}
          icon={<Zap size={16} />}
          color="text-yellow-500"
        />
        <SummaryItem 
          label="Stress & Fatigue" 
          value={`${stress}/100 • ${fatigue}/100`}
          icon={<Activity size={16} />}
          color="text-red-500"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <CheckCircle2 size={24} />
            Valider mon Check-in
          </>
        )}
      </motion.button>
    </div>
  );
};