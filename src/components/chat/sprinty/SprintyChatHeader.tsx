import React from 'react';

interface SprintyChatHeaderProps {
  onMenuClick: () => void;
  mode: 'simplified' | 'expert';
  onModeChange: (mode: 'simplified' | 'expert') => void;
}

const SprintyChatHeader: React.FC<SprintyChatHeaderProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    // z-50 to match TabBar priority and ensure visibility over content
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 h-[60px]">
        {/* Left: Toggle Mode */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onModeChange(mode === 'simplified' ? 'expert' : 'simplified')}
            className="relative h-7 w-12 rounded-full bg-gray-200 dark:bg-white/10 transition-colors focus:outline-none"
          >
             <span className="sr-only">Changer le mode</span>
             <div
              className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                mode === 'expert' ? 'translate-x-5 bg-indigo-500' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
             {mode === 'simplified' ? 'Simple' : 'Expert'}
          </span>
        </div>

        {/* Center: Sprinty Title with Shine */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <h1 className="text-2xl tracking-tight animate-text-shine-electric text-black dark:text-white font-bold">
            Sprinty
          </h1>
        </div>

        {/* Right: Empty for balance (or future use) */}
        <div className="w-12" />
      </div>
    </header>
  );
};

export default SprintyChatHeader;
