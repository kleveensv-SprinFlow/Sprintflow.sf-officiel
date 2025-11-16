import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import ToggleSwitch from '../../ui/ToggleSwitch.tsx';

const SprintyChatHeader: React.FC = () => {
  const { profile, updateSprintyMode } = useAuth();
  const navigate = useNavigate();
  
  const sprintyMode = profile?.sprinty_mode || 'simple';
  const isExpertMode = sprintyMode === 'expert';

  const handleToggle = () => {
    const newMode = isExpertMode ? 'simple' : 'expert';
    updateSprintyMode(newMode);
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-bold">Sprinty</h2>
      <div className="flex items-center gap-4">
        <ToggleSwitch
          isOn={isExpertMode}
          onToggle={handleToggle}
          leftText="Simple"
          rightText="Expert"
        />
        <button onClick={() => navigate('/sprinty/history')} className="focus:outline-none">
          <Archive className="h-6 w-6 text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary" />
        </button>
      </div>
    </div>
  );
};

export default SprintyChatHeader;
