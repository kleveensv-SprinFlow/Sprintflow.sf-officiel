// src/components/chat/sprinty/SprintyChatHeader.tsx
import React from 'react';
import { ChevronDown, MoreVertical, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SprintyIcon from '../../ui/SprintyIcon';

interface SprintyChatHeaderProps {
  onOpenMenu: () => void;
  // Nouvelle prop pour ouvrir le sélecteur de personnage
  onOpenCharacterSelector: () => void;
  // On récupère le personnage actuel pour afficher son nom
  currentCharacterName?: string;
}

const SprintyChatHeader: React.FC<SprintyChatHeaderProps> = ({ 
  onOpenMenu, 
  onOpenCharacterSelector,
  currentCharacterName = "Sprinty" // Valeur par défaut
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-16 px-4 flex items-center justify-between bg-sprint-dark-surface border-b border-white/5 shadow-sm shrink-0 z-20 relative">
      <div className="flex items-center gap-3">
        {/* Bouton retour pour sortir du mode plein écran */}
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
        >
          <ArrowLeft size={20} />
        </button>

        {/* --- ZONE CLIQUABLE DU PERSONNAGE --- */}
        <button 
          onClick={onOpenCharacterSelector}
          className="flex items-center gap-3 group px-2 py-1.5 -ml-1 rounded-xl hover:bg-white/5 transition-all duration-200"
        >
          <div className="relative">
            {/* On pourrait mettre l'avatar dynamique ici aussi */}
            <SprintyIcon className="w-9 h-9" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-sprint-dark-surface"></div>
          </div>
          
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5">
              <span className="font-manrope font-bold text-white text-[15px] tracking-wide group-hover:text-sprint-primary transition-colors">
                {currentCharacterName}
              </span>
              {/* La petite flèche demandée */}
              <ChevronDown 
                size={14} 
                className="text-gray-500 group-hover:text-sprint-primary transition-colors transform group-hover:rotate-180 duration-300" 
                strokeWidth={3}
              />
            </div>
            <span className="text-xs text-sprint-primary font-medium">
              Assistant Coach IA
            </span>
          </div>
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