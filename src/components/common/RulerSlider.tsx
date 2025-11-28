import React, { useRef, useEffect, useState } from 'react';

interface RulerSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  height?: number;
}

const RulerSlider: React.FC<RulerSliderProps> = ({
  value,
  min = 0,
  max = 5000,
  step = 50,
  onChange,
  unit = 'm',
  height = 80
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startValue, setStartValue] = useState(0);

  // Constants for rendering
  const PIXELS_PER_UNIT = 2; // 1 meter = 2 pixels
  const MAJOR_TICK_INTERVAL = 100; // Major tick every 100m
  const MINOR_TICK_INTERVAL = 50; // Minor tick every 50m
  
  // Calculate total width based on range
  const range = max - min;
  const totalWidth = range * PIXELS_PER_UNIT;

  // Center the ruler on the current value
  useEffect(() => {
    if (containerRef.current && !isDragging) {
      const halfContainer = containerRef.current.clientWidth / 2;
      const scrollPos = (value - min) * PIXELS_PER_UNIT - halfContainer;
      containerRef.current.scrollLeft = scrollPos;
    }
  }, [value, min, isDragging, PIXELS_PER_UNIT]);

  const handleScroll = () => {
    if (containerRef.current && !isDragging) {
      const scrollLeft = containerRef.current.scrollLeft;
      const halfContainer = containerRef.current.clientWidth / 2;
      const rawValue = (scrollLeft + halfContainer) / PIXELS_PER_UNIT + min;
      
      // Snap to step
      const snappedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, snappedValue));
      
      if (clampedValue !== value) {
        onChange(clampedValue);
      }
    }
  };

  // Generate ticks
  const ticks = [];
  for (let i = min; i <= max; i += step) {
    ticks.push(i);
  }

  return (
    <div className="relative w-full select-none" style={{ height }}>
      {/* Central Indicator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-blue-600 z-10 pointer-events-none"></div>
      
      {/* Value Display */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-1 z-20 pointer-events-none">
        {value} {unit}
      </div>

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing relative"
        onScroll={handleScroll}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
      >
        <div 
          className="relative h-full flex items-end"
          style={{ width: `${totalWidth + (containerRef.current?.clientWidth || 0)}px`, paddingLeft: '50%', paddingRight: '50%' }}
        >
          {ticks.map((tickValue) => {
             const isMajor = tickValue % MAJOR_TICK_INTERVAL === 0;
             return (
               <div 
                 key={tickValue}
                 className="absolute bottom-0 flex flex-col items-center"
                 style={{ 
                   left: `${(tickValue - min) * PIXELS_PER_UNIT}px`,
                   transform: 'translateX(-50%)' // Center tick on position
                 }}
               >
                 <div 
                   className={`w-0.5 bg-gray-300 dark:bg-gray-600 ${isMajor ? 'h-8' : 'h-4'}`}
                 />
                 {isMajor && (
                   <span className="text-[10px] text-gray-400 mt-1">
                     {tickValue}
                   </span>
                 )}
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default RulerSlider;
