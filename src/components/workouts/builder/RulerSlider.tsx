import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RulerSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export const RulerSlider: React.FC<RulerSliderProps> = ({
  value,
  min = 0,
  max = 1000,
  step = 50,
  onChange,
  unit = 'm'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Total width of the ruler content
  // We want to map pixels to values.
  // Let's say 1 tick = 1 step. 1 tick width = 20px?
  const tickSpacing = 20;
  const numberOfTicks = (max - min) / step;
  const totalWidth = numberOfTicks * tickSpacing;

  // Center alignment: The value should be in the center of the container.
  // So we need padding equal to half the container width.
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const scrollLeft = e.currentTarget.scrollLeft;

    // Calculate value based on scroll position
    // scrollLeft = 0 => min value
    // value = min + (scrollLeft / tickSpacing) * step

    let newValue = min + Math.round(scrollLeft / tickSpacing) * step;
    newValue = Math.max(min, Math.min(max, newValue));

    if (newValue !== value) {
        // Haptic feedback logic could go here (if supported/native)
        onChange(newValue);
    }
  };

  // Sync scroll position with value prop
  useEffect(() => {
    if (containerRef.current && !isDragging) {
      const targetScrollLeft = ((value - min) / step) * tickSpacing;
      // Smooth scroll if not dragging
      containerRef.current.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }
  }, [value, min, step, isDragging, containerWidth]);

  return (
    <div className="relative w-full h-24 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden select-none border border-gray-100 dark:border-gray-800">

      {/* Current Value Display (Floating) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 text-sprint-primary font-bold text-xl">
        {value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </div>

      {/* Center Indicator Line */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-sprint-primary z-20 rounded-full pointer-events-none transform -translate-y-1/2 mt-4"></div>

      {/* Scrollable Ruler */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-x-scroll scrollbar-hide flex items-end pb-4 pt-12 cursor-grab active:cursor-grabbing"
        onScroll={handleScroll}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => setIsDragging(false)}
      >
        <div
            className="flex relative"
            style={{
                paddingLeft: containerWidth / 2,
                paddingRight: containerWidth / 2
            }}
        >
          {Array.from({ length: numberOfTicks + 1 }).map((_, i) => {
            const tickValue = min + i * step;
            const isMajor = i % 5 === 0; // Major tick every 5 steps

            return (
              <div
                key={i}
                className="flex flex-col items-center justify-end shrink-0"
                style={{ width: tickSpacing }}
              >
                <div
                    className={`bg-gray-300 dark:bg-gray-600 rounded-t-sm ${isMajor ? 'h-8 w-0.5' : 'h-4 w-px'}`}
                ></div>
                {isMajor && (
                   <span className="text-[10px] text-gray-400 mt-1 absolute bottom-0 transform translate-y-full opacity-50">{tickValue}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
