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
    <div className="fixed inset-0 -z-10 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 overflow-hidden">
        {profile && (
          <>
            <h1 className="font-sans font-bold text-5xl md:text-7xl text-gray-300 dark:text-gray-700 select-none animated-gradient">
              {profile.first_name} {profile.last_name}
            </h1>
            {profile.role === 'athlete' && objectif && (
              <p className="font-sans text-4xl md:text-6xl text-gray-400 dark:text-gray-600 select-none mt-4 animated-gradient">
                {formatObjectifValue()}
              </p>
            )}
          </>
        )}
      </div>
      <style>{`
        .animated-gradient {
          background-image: linear-gradient(
            90deg,
            hsl(210, 8%, 70%),
            hsl(210, 8%, 50%),
            hsl(210, 8%, 70%)
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% 100%;
          animation: gradient-animation 8s ease-in-out infinite;
        }
        @media (prefers-color-scheme: dark) {
          .animated-gradient {
            background-image: linear-gradient(
              90deg,
              hsl(210, 6%, 25%),
              hsl(210, 6%, 55%),
              hsl(210, 6%, 25%)
            );
          }
        }
        @keyframes gradient-animation {
          0% {
            background-position: 200% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;