import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SprintyExpression = 'neutral' | 'happy' | 'success' | 'thinking' | 'perplexed' | 'caution' | 'frustrated' | 'sleep' | 'typing';

interface SprintyContextType {
  expression: SprintyExpression;
  setExpression: (expr: SprintyExpression) => void;
  isMenuOpen: boolean;
  setMenuOpen: (isOpen: boolean) => void;
  toggleMenu: () => void;
}

const SprintyContext = createContext<SprintyContextType | undefined>(undefined);

export const SprintyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expression, setExpression] = useState<SprintyExpression>('neutral');
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <SprintyContext.Provider value={{ expression, setExpression, isMenuOpen, setMenuOpen, toggleMenu }}>
      {children}
    </SprintyContext.Provider>
  );
};

export const useSprinty = () => {
  const context = useContext(SprintyContext);
  if (context === undefined) {
    throw new Error('useSprinty must be used within a SprintyProvider');
  }
  return context;
};
