import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`
        bg-light-card dark:bg-dark-card 
        shadow-card-light dark:shadow-card-dark 
        rounded-2xl 
        p-6 
        dark:backdrop-blur-2xl 
        animate-fade-in-slide-up
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
