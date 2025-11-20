import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/sports_loading_final.json';

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
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Container principal pour centrer le contenu */}
      <div className="flex-grow flex items-center justify-center">
        {/* Logo Lottie animé */}
        <div className="w-64 h-64">
          <Lottie 
            animationData={animationData} 
            loop={true}
            autoplay={true}
          />
        </div>
      </div>

      {/* Container pour le texte en bas */}
      <div className="w-full max-w-xs p-4 mb-12">
        <p className="text-center text-sm text-gray-400 font-medium animate-pulse tracking-wide">
          {currentMessage}
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;
