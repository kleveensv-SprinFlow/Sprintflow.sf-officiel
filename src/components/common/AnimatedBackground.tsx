import React from 'react';
import useAuth from '../../hooks/useAuth';
import useObjectif from '../../hooks/useObjectif';
import { useEffect } from 'react';

const AnimatedBackground = () => {
  const { profile } = useAuth();
  const { objectif, fetchObjectif } = useObjectif();

  useEffect(() => {
    if (profile && profile.role === 'athlete') {
      fetchObjectif(profile.id);
    }
  }, [profile]);

  const formatObjectifValue = () => {
    if (!objectif || !objectif.exercice) return '';
    
    switch (objectif.exercice.unite) {
      case 'temps':
        const minutes = Math.floor(objectif.valeur / 60);
        const seconds = objectif.valeur % 60;
        let formatted = '';
        if (minutes > 0) formatted += `${minutes}'`;
        formatted += `${seconds.toFixed(2).replace('.', '"')}`;
        return formatted;
      case 'distance':
        return `${objectif.valeur}m`;
      case 'poids':
        return `${objectif.valeur}kg`;
      case 'reps':
      case 'nb':
        return `${objectif.valeur}`;
      default:
        return objectif.valeur.toString();
    }
  };

  return (
    <div className="fixed inset-0 -z-10 bg-gray-50 dark:bg-gray-900">
      {/* Light theme background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 dark:opacity-0"
        style={{ backgroundImage: "url('https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/public/theme/Fcd-claire.png')" }}
      ></div>
      {/* Dark theme background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-0 dark:opacity-100"
        style={{ backgroundImage: "url('https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/public/theme/Fdc-Sombre.png')" }}
      ></div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 overflow-hidden">
        {profile && (
          <>
            <svg className="w-full max-w-4xl" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="textGradientLight" x1="0%" y1="0%" x2="200%" y2="0%">
                  <stop offset="0%" stopColor="hsl(210, 5%, 85%)" />
                  <stop offset="50%" stopColor="hsl(210, 5%, 65%)" />
                  <stop offset="100%" stopColor="hsl(210, 5%, 85%)" />
                  <animate attributeName="x1" values="0%;-100%;0%" dur="12s" repeatCount="indefinite" />
                  <animate attributeName="x2" values="200%;100%;200%" dur="12s" repeatCount="indefinite" />
                </linearGradient>
                <linearGradient id="textGradientDark" x1="0%" y1="0%" x2="200%" y2="0%">
                  <stop offset="0%" stopColor="hsl(210, 10%, 30%)" />
                  <stop offset="50%" stopColor="hsl(210, 10%, 60%)" />
                  <stop offset="100%" stopColor="hsl(210, 10%, 30%)" />
                  <animate attributeName="x1" values="0%;-100%;0%" dur="12s" repeatCount="indefinite" />
                  <animate attributeName="x2" values="200%;100%;200%" dur="12s" repeatCount="indefinite" />
                </linearGradient>
                <filter id="textShadowLight">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                  <feOffset dx="0" dy="1" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.1" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="textShadowDark">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                  <feOffset dx="0" dy="2" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.4" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                className="font-sans font-light select-none text-name"
                fontSize="60"
                fill="url(#textGradientLight)"
                filter="url(#textShadowLight)"
              >
                {profile.first_name} {profile.last_name}
              </text>

              {profile.role === 'athlete' && objectif && (
                <text
                  x="50%"
                  y="75%"
                  textAnchor="middle"
                  className="font-sans font-light select-none text-objectif"
                  fontSize="50"
                  fill="url(#textGradientLight)"
                  filter="url(#textShadowLight)"
                >
                  {formatObjectifValue()}
                </text>
              )}
            </svg>

            <svg className="w-full max-w-4xl absolute opacity-0 dark:opacity-100 transition-opacity duration-1000" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet">
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                className="font-sans font-light select-none text-name"
                fontSize="60"
                fill="url(#textGradientDark)"
                filter="url(#textShadowDark)"
              >
                {profile.first_name} {profile.last_name}
              </text>

              {profile.role === 'athlete' && objectif && (
                <text
                  x="50%"
                  y="75%"
                  textAnchor="middle"
                  className="font-sans font-light select-none text-objectif"
                  fontSize="50"
                  fill="url(#textGradientDark)"
                  filter="url(#textShadowDark)"
                >
                  {formatObjectifValue()}
                </text>
              )}
            </svg>
          </>
        )}
      </div>
    </div>
  );
};

export default AnimatedBackground;
