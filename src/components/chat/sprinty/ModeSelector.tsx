import React from 'react';

type Mode = 'simplified' | 'expert';

interface ModeSelectorProps {
  mode: Mode;
  onModeChange: (newMode: Mode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => {
  const toggleMode = () => {
    const newMode = mode === 'simplified' ? 'expert' : 'simplified';
    onModeChange(newMode);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`text-sm font-medium ${mode === 'simplified' ? 'text-white' : 'text-gray-400'}`}>
        Simplifié
      </span>
      <button
        onClick={toggleMode}
        className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-600 focus:outline-none"
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
            mode === 'expert' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm font-medium ${mode === 'expert' ? 'text-white' : 'text-gray-400'}`}>
        Expert
      </span>
    </div>
  );
};

export default ModeSelector;
