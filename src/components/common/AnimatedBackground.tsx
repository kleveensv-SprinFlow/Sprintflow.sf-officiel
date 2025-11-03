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
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const backgroundImageUrl = isDarkMode ? darkThemeUrl : lightThemeUrl;
  const gradientId = isDarkMode ? 'dark-flow-gradient' : 'light-flow-gradient';

  // Tracés SVG précis qui suivent les lignes de la piste sur l'image
  const paths = [
    { d: "M -50 2532 C 250 1600, 920 1600, 1220 2532", duration: "12s", delay: "0s" },
    { d: "M 80 2532 C 300 1800, 870 1800, 1090 2532", duration: "10s", delay: "2.5s" },
    { d: "M 210 2532 C 380 1950, 790 1950, 960 2532", duration: "9s", delay: "1s" },
    { d: "M 340 2532 C 450 2100, 720 2100, 830 2532", duration: "11s", delay: "4s" },
    { d: "M 485 2532 C 550 2200, 620 2200, 685 2532", duration: "13s", delay: "3s" },
  ];

  return (
    <>
      {/* Les styles sont injectés directement pour la simplicité du copier-coller */}
      <style>{`
        .animated-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          z-index: -1;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          overflow: hidden;
        }

        .svg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .flow-line {
          stroke-width: 2;
          fill: none;
          stroke-linecap: round;
          /* La longueur du trait visible (la "lueur") */
          stroke-dasharray: 200; 
          /* La longueur totale de la ligne pointillée (très grande pour créer un grand espace) */
          stroke-dashoffset: 3000;
          animation-name: flow;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }

        @keyframes flow {
          from {
            /* Commence en dehors de la vue */
            stroke-dashoffset: 3000;
          }
          to {
            /* Termine son parcours en dehors de la vue */
            stroke-dashoffset: -3000;
          }
        }
      `}</style>
      <div
        className="animated-background"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        <div className="svg-overlay">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 1170 2532"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Dégradé subtil pour le thème clair */}
              <linearGradient id="light-flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
              </linearGradient>
              
              {/* Dégradé subtil pour le thème sombre */}
              <linearGradient id="dark-flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
                <stop offset="50%" stopColor="rgba(34, 211, 238, 0.7)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
              </linearGradient>
            </defs>
            
            {paths.map((p, index) => (
              <path
                key={index}
                className="flow-line"
                d={p.d}
                stroke={`url(#${gradientId})`}
                style={{
                  animationDuration: p.duration,
                  animationDelay: p.delay,
                }}
              />
            ))}
          </svg>
        </div>
      </div>
    </>
  );
};

export default AnimatedBackground;
