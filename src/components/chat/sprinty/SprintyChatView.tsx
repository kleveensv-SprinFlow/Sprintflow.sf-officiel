// src/components/chat/sprinty/SprintyChatView.tsx
import React, { useState } from 'react';
// ... imports existants ...
import SprintyChatHeader from './SprintyChatHeader';
import CharacterSelectorModal from './CharacterSelectorModal'; // Assurez-vous que ce chemin est correct
import { useSprintyContext } from '../../../context/SprintyContext'; // Supposons que vous ayez ce contexte

const SprintyChatView: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCharacterSelectorOpen, setIsCharacterSelectorOpen] = useState(false);
  
  // Récupération du personnage actif depuis le contexte ou l'état local
  // Si vous n'avez pas de contexte, utilisez un state local : const [persona, setPersona] = useState('Sprinty');
  const { currentPersona, setPersona } = useSprintyContext(); 

  return (
    <div className="flex flex-col h-full bg-sprint-dark-background relative overflow-hidden">
      
      {/* HEADER : On passe le nom et la fonction d'ouverture */}
      <SprintyChatHeader 
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenCharacterSelector={() => setIsCharacterSelectorOpen(true)}
        currentCharacterName={currentPersona?.name || "Sprinty"} 
      />

      {/* ... Le reste du contenu (Messages, Input) ... */}
      <div className="flex-1 overflow-y-auto relative z-0">
         {/* Votre liste de messages ici */}
      </div>

      {/* ... Input Area ... */}

      {/* MODALES */}
      
      {/* La modale de sélection de personnage */}
      {isCharacterSelectorOpen && (
        <CharacterSelectorModal 
          isOpen={isCharacterSelectorOpen}
          onClose={() => setIsCharacterSelectorOpen(false)}
          onSelect={(persona) => {
            setPersona(persona); // Change le personnage
            setIsCharacterSelectorOpen(false); // Ferme la modale
          }}
        />
      )}

      {/* ... Autres modales (Menu, etc.) ... */}
    </div>
  );
};

export default SprintyChatView;