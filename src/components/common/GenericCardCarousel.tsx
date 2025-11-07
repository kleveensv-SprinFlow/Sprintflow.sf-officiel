// src/components/common/GenericCardCarousel.tsx
import React from 'react';

interface GenericCardCarouselProps {
  children: React.ReactNode;
}

export const GenericCardCarousel: React.FC<GenericCardCarouselProps> = ({ children }) => {
  const childrenArray = React.Children.toArray(children);

  if (childrenArray.length === 0) {
    return null; // Ne rien rendre si il n'y a pas d'enfants
  }

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar space-x-4 pb-2 px-4">
      {childrenArray.map((child, index) => (
        <div key={index} className="snap-center flex-shrink-0 w-[85%] sm:w-[45%] md:w-[30%] h-full">
          {child}
        </div>
      ))}
    </div>
  );
};