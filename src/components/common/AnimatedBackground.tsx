// src/components/common/AnimatedBackground.tsx

import React, { useState, useEffect } from 'react';

const lightThemeUrl = 'https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/public/theme/Fcd-claire.png';
const darkThemeUrl = 'https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/public/theme/Fdc-Sombre.png';

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

  return (
    <>
      <style>{`
        .animated-background-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh; /* Utilise 100vh pour couvrir tout le viewport */
          z-index: -1;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          overflow: hidden;
        }

        .svg-mask-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        /* Animation qui déplace le dégradé verticalement */
        @keyframes slide-gradient {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        
        .animated-gradient {
          animation: slide-gradient 10s linear infinite;
        }
      `}</style>
      <div
        className="animated-background-container"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        <div className="svg-mask-overlay">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 1170 2532"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Le masque est défini par le contour blanc des tracés */}
              <mask id="track-lines-mask">
                <g>
                  {/* Tracés SVG qui suivent les lignes de la piste */}
                  <path d="M -50 2532 C 250 1600, 920 1600, 1220 2532" stroke="white" strokeWidth="5" fill="none" />
                  <path d="M 80 2532 C 300 1800, 870 1800, 1090 2532" stroke="white" strokeWidth="5" fill="none" />
                  <path d="M 210 2532 C 380 1950, 790 1950, 960 2532" stroke="white" strokeWidth="5" fill="none" />
                  <path d="M 340 2532 C 450 2100, 720 2100, 830 2532" stroke="white" strokeWidth="5" fill="none" />
                  <path d="M 485 2532 C 550 2200, 620 2200, 685 2532" stroke="white" strokeWidth="5" fill="none" />
                </g>
              </mask>

              {/* Dégradé pour le thème clair */}
              <linearGradient id="light-gradient" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.7)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
              </linearGradient>

              {/* Dégradé pour le thème sombre */}
              <linearGradient id="dark-gradient" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
                <stop offset="50%" stopColor="rgba(34, 211, 238, 0.8)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
              </linearGradient>
            </defs>

            {/* Rectangle qui remplit tout le SVG */}
            {/* Il est masqué par nos lignes et rempli par le dégradé animé */}
            <rect 
              x="0" 
              y="0" 
              width="100%" 
              height="100%" 
              mask="url(#track-lines-mask)" 
              fill={isDarkMode ? "url(#dark-gradient)" : "url(#light-gradient)"} 
              className="animated-gradient"
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export default AnimatedBackground;