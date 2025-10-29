import React, { useState, useRef, useEffect } from 'react';
import { SelectionCard } from './SelectionCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CardCarouselProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({ options, selectedValue, onSelect }) => {
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
    const currentRef = scrollRef.current;
    currentRef?.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollable);
    
    return () => {
      clearTimeout(timer);
      currentRef?.removeEventListener('scroll', handleScroll);
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

  const scrollBy = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const activeDotIndex = Math.round(scrollProgress * (options.length - 1));
  const cardWidth = 128 + 16; // w-32 (128px) + space-x-4 (16px)

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto pb-4 scroll-smooth"
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

      {isScrollable && (
        <>
          {/* Flèche Gauche */}
          <button
            onClick={() => scrollBy(-cardWidth)}
            className={`absolute top-1/2 -translate-y-1/2 -left-4 p-1 bg-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 focus:outline-none disabled:opacity-0 disabled:cursor-not-allowed hidden md:block`}
            disabled={scrollProgress < 0.01}
          >
            <ChevronLeft size={24} />
          </button>
          {/* Flèche Droite */}
          <button
            onClick={() => scrollBy(cardWidth)}
            className={`absolute top-1/2 -translate-y-1/2 -right-4 p-1 bg-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 focus:outline-none disabled:opacity-0 disabled:cursor-not-allowed hidden md:block`}
            disabled={scrollProgress > 0.99}
          >
            <ChevronRight size={24} />
          </button>

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
        </>
      )}
    </div>
  );
};