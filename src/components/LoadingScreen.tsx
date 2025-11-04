import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Installation des haies...",
  "Vérification des starting-blocks...",
  "Chronométrage en cours...",
  "Analyse de la foulée...",
  "Préparation de la zone d'élan...",
  "Mesure du vent...",
  "Synchronisation des données...",
];

export function LoadingScreen() {
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    setCurrentMessage(loadingMessages[randomIndex]);

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setCurrentMessage(loadingMessages[randomIndex]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center z-50">
      {/* Container principal pour centrer le contenu */}
      <div className="flex-grow flex items-center justify-center">
        {/* Logo animé */}
        <img
          src="/logo-sprintflow.png"
          alt="SprintFlow Logo"
          className="w-40 h-40 animate-spin-float"
        />
      </div>

      {/* Container pour la barre de chargement et le texte en bas */}
      <div className="w-full max-w-xs p-4 mb-8">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">
          {currentMessage}
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div className="h-full rounded-full animate-progress-bar"></div>
        </div>
      </div>
    </div>
  );
}