import React from 'react';

type TypographyProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
};

// H1 / Titre principal
export const H1: React.FC<TypographyProps> = ({ children, className = '', as = 'h1' }) => {
  const Component = as;
  return <Component className={`font-sans font-bold text-h1 text-light-title dark:text-dark-title ${className}`}>{children}</Component>;
};

// H2 / Titre secondaire
export const H2: React.FC<TypographyProps> = ({ children, className = '', as = 'h2' }) => {
  const Component = as;
  return <Component className={`font-sans font-semibold text-h2 text-light-title dark:text-dark-title ${className}`}>{children}</Component>;
};

// H3 / Titre tertiaire
export const H3: React.FC<TypographyProps> = ({ children, className = '', as = 'h3' }) => {
  const Component = as;
  return <Component className={`font-sans font-medium text-h3 text-light-text dark:text-dark-text ${className}`}>{children}</Component>;
};

// Texte normal / Body
export const P: React.FC<TypographyProps> = ({ children, className = '', as = 'p' }) => {
  const Component = as;
  return <Component className={`font-sans font-normal text-base text-light-text dark:text-dark-text ${className}`}>{children}</Component>;
};

// Libellés / Labels
export const Label: React.FC<TypographyProps> = ({ children, className = '', as = 'span' }) => {
  const Component = as;
  return <Component className={`font-sans font-medium text-label text-light-label dark:text-dark-label ${className}`}>{children}</Component>;
};

// Micro-text / Helper
export const MicroText: React.FC<TypographyProps> = ({ children, className = '', as = 'span' }) => {
  const Component = as;
  return <Component className={`font-sans font-light text-micro text-light-label dark:text-dark-label ${className}`}>{children}</Component>;
};
