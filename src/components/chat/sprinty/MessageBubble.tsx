// MODIFICATION 1 : La bulle elle-même (le conteneur du message)
const bubbleContentClasses = `px-4 py-2.5 rounded-xl 
    ${
      isUser
        // Bulle Utilisateur : On garde l'arrondi et on le retire SEULEMENT sur le coin bas-droit (le coin près du locuteur)
        ? 'bg-sprint-accent text-white rounded-br-none'
        // Bulle Sprinty : On garde l'arrondi et on le retire SEULEMENT sur le coin bas-gauche
        : 'bg-sprint-light-surface/90 dark:bg-sprint-dark-surface-secondary text-sprint-dark-text rounded-bl-none' 
    }
  `;

// MODIFICATION 2 : L'ancien code de votre composant n'utilisait pas de bulle générale, mais l'appliquait directement :

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  // Bulle Content Styling: Color, Corners, and Padding
  const bubbleContentClasses = `px-4 py-2.5 rounded-xl // <-- FORCER L'ARRONDI ICI
    ${
      isUser
        // Utilisation de rounded-xl (plus sûr que 2xl) et suppression du coin bas-droit pour la queue
        ? 'bg-sprint-accent text-white rounded-br-none'
        // Suppression du coin bas-gauche pour la queue
        : 'bg-sprint-light-surface/90 dark:bg-sprint-dark-surface-secondary text-sprint-dark-text rounded-bl-none' 
    }
  `;

  return (
    // ... reste du code ...
    // Le reste de la logique reste le même
    // ...
  );
};