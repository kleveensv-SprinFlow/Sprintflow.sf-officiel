// src/components/common/CardCarousel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { SelectionCard } from './SelectionCard';

interface CardCarouselProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({ options, selectedValue, onSelect }) => {
  // ✅ Vérification de sécurité
  if (!options || options.length === 0) {
    return null;
  }

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScrollable = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setIsScrollable(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScrollable, 100);
    window.addEventListener('resize', checkScrollable);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [options]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = scrollWidth > clientWidth ? scrollLeft / (scrollWidth - clientWidth) : 0;
      setScrollProgress(progress);
    }
  };

  // ✅ Protection contre undefined
  const activeDotIndex = options?.length > 0 ? Math.round(scrollProgress * (options.length - 1)) : 0;

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex space-x-4 overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
      {isScrollable && (
        <div className="flex justify-center items-center space-x-2 mt-2 h-2">
          {options.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === activeDotIndex ? 'bg-orange-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardCarousel;