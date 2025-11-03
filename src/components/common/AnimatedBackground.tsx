import React, { useState, useEffect } from 'react';

const lightThemeUrl = 'https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/public/theme/Fcd-claire.png';
const darkThemeUrl = 'https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/public/theme/Fdc-Sombre.png';

const AnimatedBackground: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Détecte le thème du système au chargement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    // Écoute les changements de thème
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);

    // Nettoyage de l'écouteur d'événement
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const backgroundImageUrl = isDarkMode ? darkThemeUrl : lightThemeUrl;
  const strokeColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)';

  return (
    <div 
      className="animated-background"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="svg-overlay">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Note: Les tracés ci-dessous sont des estimations basées sur l'image.
              Ils pourraient nécessiter un ajustement fin pour un alignement parfait. */}
          
          {/* Ligne centrale gauche */}
          <path
            className="animated-line"
            d="M 450 600 Q 480 300, 490 0"
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Ligne centrale droite */}
          <path
            className="animated-line"
            d="M 550 600 Q 520 300, 510 0"
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            style={{ animationDelay: '15s' }} // Décalage pour un effet asynchrone
          />
        </svg>
      </div>
    </div>
  );
};

export default AnimatedBackground;