import React from 'react';

interface SprintyChatHeaderProps {
  onMenuClick: () => void;
  mode: 'simplified' | 'expert';
  onModeChange: (mode: 'simplified' | 'expert') => void;
}

const SprintyChatHeader: React.FC<SprintyChatHeaderProps> = ({
  onMenuClick,
  mode,
  onModeChange,
}) => {
  return (
    // Masque opaque : même couleur que le fond + légère ombre
    <header className="w-full bg-light-background dark:bg-dark-background shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Bouton menu (burger) */}
        <button
          type="button"
          onClick={onMenuClick}
          className="text-white/80 hover:text-white focus:outline-none"
        >
          <span className="sr-only">Ouvrir le menu des conversations</span>
          <div className="space-y-1">
            <span className="block w-5 h-0.5 bg-white rounded" />
            <span className="block w-5 h-0.5 bg-white rounded" />
          </div>
        </button>

        {/* Toggle Simplifié / Expert */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onModeChange('simplified')}
            className={`text-sm ${
              mode === 'simplified' ? 'text-white font-semibold' : 'text-white/60'
            }`}
          >
            Simplifié
          </button>

          <div className="w-10 h-5 bg-white/20 rounded-full flex items-center px-1">
            <div
              className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                mode === 'simplified' ? 'translate-x-0' : 'translate-x-5'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => onModeChange('expert')}
            className={`text-sm ${
              mode === 'expert' ? 'text-white font-semibold' : 'text-white/60'
            }`}
          >
            Expert
          </button>
        </div>

        {/* Avatar Sprinty (placeholder) */}
        <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
          <span className="text-xs text-white/80">SP</span>
        </div>
      </div>
    </header>
  );
};

export default SprintyChatHeader;