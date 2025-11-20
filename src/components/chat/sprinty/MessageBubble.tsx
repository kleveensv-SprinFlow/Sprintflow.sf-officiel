import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'sprinty';
    component?: React.ReactNode;
  };
  // L'avatar est exclu de ce composant car il sera dans la barre de saisie/FAB.
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  // Bulle Content Styling: Couleur et Coins (la distinction se fait par la couleur et la forme)
  const bubbleContentClasses = `px-4 py-2.5 
    ${
      isUser
        // COULEUR UTILISATEUR (Accentuation) : Aligné à droite, coin du haut à droite coupé.
        ? 'bg-sprint-accent text-white rounded-br-none'
        // COULEUR SPRINTY (Neutre/Surface) : Aligné à gauche, coin du haut à gauche coupé.
        : 'bg-sprint-light-surface/90 dark:bg-sprint-dark-surface-secondary text-sprint-dark-text rounded-bl-none' 
    }
  `;

  return (
    // Conteneur principal pour l'alignement et l'espacement
    <div
      className={`flex w-full mb-3 ${
        isUser ? 'justify-end' : 'justify-start' // Aligne à droite (user) ou à gauche (Sprinty)
      }`}
    >
      
      {/* Conteneur de contenu (limite la largeur de la bulle) */}
      <div className="max-w-[85%]">
        
        {message.text && (
          <div className={bubbleContentClasses}>
            {/* CORRECTION TAILLE : Utilisation de text-sm pour un affichage plus compact sur mobile. */}
            <div className="text-sm dark:text-white max-w-none prose prose-p:my-0"> 
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          </div>
        )}
        
        {/* Carte de Données / Composant */}
        {message.component && (
          <div className={`mt-1.5 ${isUser ? 'flex justify-end' : ''}`}>
            {message.component}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;