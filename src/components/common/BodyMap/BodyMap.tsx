import React from 'react';
import { motion } from 'framer-motion';
import { 
  BODY_PARTS_MALE_FRONT, 
  BODY_PARTS_MALE_BACK, 
  BODY_PARTS_FEMALE_FRONT, 
  BODY_PARTS_FEMALE_BACK,
  BodyPart 
} from './BodyPaths.ts';

interface BodyMapProps {
  gender: 'homme' | 'femme';
  view: 'front' | 'back';
  selectedZones: string[];
  onZoneToggle: (zoneId: string, zoneName: string) => void;
  className?: string;
}

export const BodyMap: React.FC<BodyMapProps> = ({ 
  gender, 
  view, 
  selectedZones, 
  onZoneToggle,
  className = ''
}) => {
  
  const getPaths = (): BodyPart[] => {
    if (gender === 'femme') {
      return view === 'front' ? BODY_PARTS_FEMALE_FRONT : BODY_PARTS_FEMALE_BACK;
    }
    return view === 'front' ? BODY_PARTS_MALE_FRONT : BODY_PARTS_MALE_BACK;
  };

  const paths = getPaths();

  return (
    <div className={`relative w-full aspect-[1/2.8] ${className}`}>
      <svg 
        viewBox="0 0 100 280" 
        className="w-full h-full drop-shadow-xl"
        style={{ filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.1))' }}
      >
        {paths.map((part) => {
          const isSelected = selectedZones.includes(part.id);
          
          return (
            <motion.path
              key={part.id}
              d={part.path}
              onClick={() => onZoneToggle(part.id, part.name)}
              initial={false}
              animate={{
                fill: isSelected ? '#EF4444' : 'var(--body-fill)',
                scale: isSelected ? 1.02 : 1,
              }}
              whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.98 }}
              className={`
                cursor-pointer transition-colors duration-200 stroke-white dark:stroke-gray-800 stroke-[0.5]
                ${isSelected ? 'fill-red-500' : 'fill-gray-200 dark:fill-gray-600'}
              `}
              style={{
                transformOrigin: 'center',
                // CSS variable fallback if framer-motion animation doesn't catch immediately
                '--body-fill': isSelected ? '#EF4444' : '#E5E7EB', // Taildwind gray-200
              } as React.CSSProperties}
            />
          );
        })}
      </svg>
      
      {/* Visual Helper for Orientation */}
      <div className="absolute top-0 right-0 text-xs font-bold text-gray-400 uppercase tracking-widest opacity-50 pointer-events-none">
        {view === 'front' ? 'Face' : 'Dos'}
      </div>
    </div>
  );
};
