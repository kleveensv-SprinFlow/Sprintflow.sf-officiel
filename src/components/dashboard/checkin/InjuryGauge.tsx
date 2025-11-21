import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { SemanticSlider } from '../../common/SemanticSlider.tsx';

interface InjuryGaugeProps {
  zoneName: string;
  painLevel: number;
  onChange: (value: number) => void;
  onRemove: () => void;
}

export const InjuryGauge: React.FC<InjuryGaugeProps> = ({ 
  zoneName, 
  painLevel, 
  onChange, 
  onRemove 
}) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-gray-800/50 rounded-xl p-3 mb-3 shadow-sm border border-gray-100 dark:border-white/5"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-sm text-gray-700 dark:text-gray-200">{zoneName}</span>
        <button 
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="h-12 relative">
         <SemanticSlider 
            label="" 
            minLabel="Léger" 
            maxLabel="Sévère" 
            value={painLevel * 10} // Scale 1-10 to 0-100 for slider
            onChange={(val) => onChange(Math.ceil(val / 10))} // Scale back to 1-10
            orientation="horizontal"
            showValue={true} // Assuming SemanticSlider supports this, if not I'll adjust
         />
         {/* Overlay value if slider doesn't show it */}
         <div className="absolute -top-7 right-8 text-xs font-bold text-primary">
            {painLevel}/10
         </div>
      </div>
    </motion.div>
  );
};
