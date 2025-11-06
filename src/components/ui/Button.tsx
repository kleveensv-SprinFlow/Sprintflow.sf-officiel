import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
};

const Button: React.FC<ButtonProps> = ({ children, onClick, className = '', variant = 'primary' }) => {
  const baseStyles = 'font-sans font-medium text-base rounded-lg transition-all duration-200 ease-out transform focus:outline-none';

  const variantStyles = {
    primary: 'bg-sprintflow-blue text-white shadow-lg hover:brightness-110 hover:shadow-button-glow active:scale-[0.98]',
    secondary: 'bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
