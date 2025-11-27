import React from 'react';
import { ChevronDown, MoreVertical, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SprintyChatHeaderProps {
  onOpenMenu: () => void;
  onOpenCharacterSelector: () => void;
  currentCharacterName?: string;
}

const SprintyChatHeader: React.FC<SprintyChatHeaderProps> = ({ 
  onOpenMenu, 
  onOpenCharacterSelector,
  currentCharacterName = "Sprinty" 
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-16 px-4 flex items-center justify-between bg-[#050B14]/90 backdrop-blur-md border-b border-white/5 shadow-sm shrink-0 z-50 relative">
      <div className="flex items-center gap-1">
        {/* Bouton retour mobile */}
        <button 
          onClick={() => navigate('/')}
          className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 mr-1"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Zone cliquable pour changer de personnage */}
        <button 
          onClick={onOpenCharacterSelector}
          className="flex flex-col items-start group rounded-lg hover:bg-white/5 px-2 py-1 transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="font-manrope font-extrabold text-white text-[17px] tracking-tight group-hover:text-sprint-primary transition-colors">
              {currentCharacterName}
            </span>
            <ChevronDown 
              size={14} 
              className="text-gray-500 group-hover:text-sprint-primary transition-transform duration-300 group-hover:rotate-180" 
              strokeWidth={3}
            />
          </div>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
            Assistant Coach IA
          </span>
        </button>
      </div>

      <button 
        onClick={onOpenMenu}
        className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
      >
        <MoreVertical size={20} />
      </button>
    </div>
  );
};

export default SprintyChatHeader;