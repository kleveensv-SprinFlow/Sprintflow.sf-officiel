// src/components/chat/sprinty/SprintyChatHeader.tsx
import React from 'react';
import { ChevronDown, MoreVertical, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// On supprime l'import de SprintyIcon

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
    // Header fixé en haut, fond très sombre pour le contraste premium
    <div className="h-16 px-4 flex items-center justify-between bg-sprint-dark-surface border-b border-white/5 shadow-sm shrink-0 z-50 relative">
      
      <div className="flex items-center gap-2">
        {/* Zone cliquable pour changer de personnage */}
        <button 
          onClick={onOpenCharacterSelector}
          className="flex flex-col items-start group rounded-lg hover:bg-white/5 px-3 py-1.5 transition-all duration-200 -ml-2"
        >
          <div className="flex items-center gap-2">
            {/* TYPOGRAPHIE SEULE : Gros, Gras, Premium */}
            <span className="font-manrope font-extrabold text-white text-[18px] tracking-tight group-hover:text-sprint-primary transition-colors">
              {currentCharacterName}
            </span>
            
            {/* Indicateur discret de menu déroulant */}
            <ChevronDown 
              size={14} 
              className="text-gray-500 group-hover:text-sprint-primary transition-transform duration-300 group-hover:rotate-180" 
              strokeWidth={3}
            />
          </div>
          
          {/* Sous-titre fonctionnel très discret */}
          <span className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">
            Assistant Coach IA
          </span>
        </button>
      </div>

      {/* Menu Action à droite */}
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