import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface NumberSelectorProps {
  label: string;
  value: number | '';
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const NumberSelector: React.FC<NumberSelectorProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  unit = '',
}) => {
  const ITEM_HEIGHT = 36;
  const DRAG_THRESHOLD = 10;

  const y = useMotionValue(0);
  const springY = useSpring(y, { damping: 20, stiffness: 300 });

  const [displayValue, setDisplayValue] = useState(value === '' ? min : value);

  useEffect(() => {
    setDisplayValue(value === '' ? min : value);
  }, [value, min]);

  const handleDragEnd = (event: any, info: any) => {
    springY.set(0);
    const offset = info.offset.y;

    if (Math.abs(offset) < DRAG_THRESHOLD) {
      return; // C'est un clic, pas un glissement
    }
    
    const draggedItems = Math.round(offset / ITEM_HEIGHT);
    let newValue = displayValue - draggedItems * step;
    
    // Bloquer la valeur dans les limites min/max
    newValue = Math.max(min, Math.min(max, newValue));
    // Aligner sur le pas le plus proche
    newValue = Math.round(newValue / step) * step;
    
    if (newValue > max) newValue = max;
    if (newValue < min) newValue = min;

    onChange(newValue);
  };

  const handleIncrement = () => {
    const currentValue = typeof value === 'number' ? value : min - step;
    const newValue = Math.min(max, currentValue + step);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const currentValue = typeof value === 'number' ? value : min;
    const newValue = Math.max(min, currentValue - step);
    // Ne rien faire si on est déjà au minimum
    if (newValue >= min) {
      onChange(newValue);
    }
  };
  
  // Vérifier si on est au minimum pour désactiver le bouton
  const isAtMin = typeof value === 'number' && value <= min;
  const isAtMax = typeof value === 'number' && value >= max;
  
  // Affiche 5 numéros pour l'effet de roulement
  const numbers = [
    displayValue - 2 * step,
    displayValue - 1 * step,
    displayValue,
    displayValue + 1 * step,
    displayValue + 2 * step,
  ];

  return (
    <div className="flex flex-col items-center">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 text-center">
        {label}
      </label>
      <div className="flex flex-col items-center">
        <button 
          type="button" 
          onClick={handleIncrement} 
          disabled={isAtMax}
          className={`text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-opacity ${
            isAtMax ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ChevronUp size={20} />
        </button>
        <div className="h-9 w-28 overflow-hidden relative cursor-grab active:cursor-grabbing">
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            className="flex flex-col items-center"
            style={{ y: springY }}
          >
            {numbers.map((num, i) => {
               let opacity = 1;
               let scale = 1;
               const distanceFromCenter = Math.abs(i - 2);
               
               if (distanceFromCenter === 2) {
                 opacity = 0.2;
                 scale = 0.7;
               } else if (distanceFromCenter === 1) {
                 opacity = 0.5;
                 scale = 0.9;
               }

              return (
                <motion.div
                  key={i}
                  className="flex items-center justify-center h-9 text-lg font-semibold text-gray-800 dark:text-gray-200"
                  style={{ height: ITEM_HEIGHT, opacity, scale }}
                >
                  {num}{unit}
                </motion.div>
              );
            })}
          </motion.div>
          <div className="absolute inset-0 border-y-2 border-primary-500/50 pointer-events-none" style={{ top: ITEM_HEIGHT, bottom: ITEM_HEIGHT }} />
        </div>
        <button 
          type="button" 
          onClick={handleDecrement} 
          disabled={isAtMin}
          className={`text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-opacity ${
            isAtMin ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ChevronDown size={20} />
        </button>
      </div>
    </div>
  );
};
