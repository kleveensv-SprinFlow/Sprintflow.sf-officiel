import React from 'react';
import { ChevronDown, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSprinty } from '../../../context/SprintyContext';

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
  const { currentPersona } = useSprinty();

  return (
    <div className="h-16 px-4 flex items-center justify-between bg-[#050B14]/90 backdrop-blur-md border-b border-white/5 shadow-sm shrink-0 z-50 relative">
      {/* Spacer to center the title */}
      <div className="w-10"></div>

      {/* Zone cliquable pour changer de personnage */}
      <button
        onClick={onOpenCharacterSelector}
        className="flex flex-col items-center group rounded-lg hover:bg-white/5 px-4 py-1 transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <span
            className="font-manrope font-extrabold text-[17px] tracking-tight animate-shine"
            style={{
              color: currentPersona.color,
              textShadow: `0 0 10px ${currentPersona.shadowColor}`
            }}
          >
            {currentCharacterName}
          </span>
          <ChevronDown
            size={14}
            className="text-gray-500 group-hover:text-white transition-transform duration-300 group-hover:rotate-180"
            strokeWidth={3}
          />
        </div>
        <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
          Assistant Coach IA
        </span>
      </button>

      <button 
        onClick={onOpenMenu}
        className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 flex justify-end"
      >
        <MoreVertical size={20} />
      </button>
    </div>
  );
};

export default SprintyChatHeader;
