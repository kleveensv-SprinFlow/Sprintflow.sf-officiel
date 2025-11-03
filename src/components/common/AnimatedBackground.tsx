import React, { useState, useEffect } from 'react';

const lightThemeUrl = 'https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/public/theme/Fcd-claire.png';
const darkThemeUrl = 'https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/public/theme/Fdc-Sombre.png';

// Un composant pour une seule ligne animée, pour garder le code propre
const AnimatedLine: React.FC<{ d: string; strokeUrl: string; duration: string; delay?: string }> = ({ d, strokeUrl, duration, delay }) => (
  <path
    d={d}
    stroke={`url(#${strokeUrl})`}
    strokeWidth="2.5"
    fill="none"
    strokeLinecap="round"
    style={{
      maskImage: `url(#${strokeUrl})`,
      animation: `moveGradient ${duration} linear infinite`,
      animationDelay: delay || '0s',
    }}
  />
);

const AnimatedBackground: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const backgroundImageUrl = isDarkMode ? darkThemeUrl : lightThemeUrl;

  // Définitions des chemins SVG (plus nombreux pour couvrir la piste)
  // Ces coordonnées sont des estimations et pourraient nécessiter un ajustement.
  const paths = [
    { d: "M 250 600 Q 350 300, 400 0", duration: "10s" },
    { d: "M 350 600 Q 420 300, 450 0", duration: "12s", delay: "2s" },
    { d: "M 450 600 Q 480 300, 490 0", duration: "9s", delay: "1s" },
    { d: "M 550 600 Q 520 300, 510 0", duration: "11s", delay: "3s" },
    { d: "M 650 600 Q 580 300, 550 0", duration: "13s", delay: "0.5s" },
    { d: "M 750 600 Q 650 300, 600 0", duration: "10s", delay: "2.5s" },
  ];

  const gradientId = isDarkMode ? "dark-gradient" : "light-gradient";

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
          <defs>
            {/* Dégradé pour le thème clair */}
            <linearGradient id="light-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.8)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>
            
            {/* Dégradé pour le thème sombre */}
            <linearGradient id="dark-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
              <stop offset="50%" stopColor="rgba(34, 211, 238, 0.9)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>
          </defs>

          {paths.map((path, index) => (
            <AnimatedLine 
              key={index}
              d={path.d}
              strokeUrl={gradientId}
              duration={path.duration}
              delay={path.delay}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default AnimatedBackground;