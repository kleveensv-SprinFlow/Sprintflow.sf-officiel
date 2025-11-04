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
            <h1 className="font-noto-sans font-bold text-5xl md:text-7xl text-gray-300 dark:text-gray-700 select-none animate-pulse-glow">
              {profile.first_name} {profile.last_name}
            </h1>
            {profile.role === 'athlete' && objectif && (
              <p className="font-din text-4xl md:text-6xl text-gray-400 dark:text-gray-600 select-none mt-4 animate-pulse-glow-delayed">
                {formatObjectifValue()}
              </p>
            )}
          </>
        )}
      </div>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            text-shadow: 0 0 5px rgba(59, 130, 246, 0.3), 0 0 10px rgba(59, 130, 246, 0.3);
          }
          50% {
            text-shadow: 0 0 15px rgba(59, 130, 246, 0.7), 0 0 30px rgba(59, 130, 246, 0.7);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 6s ease-in-out infinite;
        }
        .animate-pulse-glow-delayed {
            animation: pulse-glow 6s ease-in-out infinite;
            animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;