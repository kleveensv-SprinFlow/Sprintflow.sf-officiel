import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

/**
 * Standardized Card Component for the "GOWOD" Dark Mode look.
 * - Background: Dark Anthracite Surface (#1C1C1E)
 * - Shadow: None
 * - Border: None (handled by global config, but explicit here for safety)
 * - Interaction: Subtle scale effect on active/hover
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  onClick,
  noPadding = false
}) => {
  return (
    <div
      className={`
        bg-sprint-dark-surface
        rounded-2xl
        overflow-hidden
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:bg-sprint-dark-surface-elevated active:scale-[0.98]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {title && (
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-lg font-bold text-white font-manrope">{title}</h3>
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
};

export default Card;
