import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { SelectionCard } from './SelectionCard';

interface CardCarouselProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({ options, selectedValue, onSelect }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = scrollWidth > clientWidth ? scrollLeft / (scrollWidth - clientWidth) : 0;
      setScrollProgress(progress);
    }
  };

  return (
    <div>
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex space-x-4 overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'none', '-ms-overflow-style': 'none' }}
      >
        {options.map(option => (
          <div key={option.value} className="flex-shrink-0 w-32">
            <SelectionCard
              label={option.label}
              isSelected={selectedValue === option.value}
              onClick={() => onSelect(option.value)}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center space-x-2 mt-2">
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-1 bg-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${scrollProgress * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        </div>
      </div>
    </div>
  );
};