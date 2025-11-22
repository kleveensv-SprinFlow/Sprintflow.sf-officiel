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
    <header className="fixed top-0 left-0 right-0 z-[60] w-full bg-[#050B14] border-b border-white/5 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 h-[60px]">
        {/* Left: Toggle Mode */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onModeChange(mode === 'simplified' ? 'expert' : 'simplified')}
            className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none ${
              mode === 'expert' ? 'bg-indigo-600' : 'bg-white/10'
            }`}
          >
             <span className="sr-only">Changer le mode</span>
             <div
              className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                mode === 'expert' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-400">
             {mode === 'simplified' ? 'Simple' : 'Expert'}
          </span>
        </div>

        {/* Center: Sprinty Title with Gradient */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <h1 className="text-2xl tracking-tight font-bold bg-gradient-to-r from-[#4F46E5] to-[#9333EA] bg-clip-text text-transparent drop-shadow-sm">
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
