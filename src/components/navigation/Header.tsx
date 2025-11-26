import React, { useState, useEffect } from 'react';
import { Settings, ChevronLeft, User as UserIcon } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

// Définition des nouvelles props pour le Header
interface HeaderProps {
  currentView: 'dashboard' | 'profile' | 'settings';
  onNavigate: (target: 'profile' | 'settings' | 'back') => void;
  isLoading: boolean;
}

export default function Header({ currentView, onNavigate, isLoading }: HeaderProps) {
  const { profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Effet pour détecter le scroll et adapter le style du header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Logique d'affichage pour la partie gauche du header
  const renderLeftPart = () => {
    if (currentView === 'dashboard') {
      return (
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white font-manrope tracking-tight">
          SPRINTFLOW
        </h1>
      );
    }
    // Pour les autres vues, on affiche un bouton "Retour"
    return (
      <button
        onClick={() => onNavigate('back')}
        className="p-2 -ml-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-white"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </button>
    );
  };

  // Logique d'affichage pour la partie droite du header
  const renderRightPart = () => {
    if (currentView === 'dashboard') {
      if (isLoading) {
        return <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />;
      }
      return (
        <button
          onClick={() => onNavigate('profile')}
          className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/20 transition-transform active:scale-95"
        >
          {profile?.photo_url ? (
            <img src={profile.photo_url} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" strokeWidth={2} />
            </div>
          )}
        </button>
      );
    }
    if (currentView === 'profile') {
      return (
        <button
          onClick={() => onNavigate('settings')}
          className="p-2 -mr-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-white"
        >
          <Settings className="h-6 w-6" strokeWidth={2} />
        </button>
      );
    }
    // Pas d'icône à droite pour la page des paramètres
    return <div className="w-9 h-9" />; // Placeholder pour garder l'alignement
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out 
                 pt-[env(safe-area-inset-top)] ${
                   isScrolled
                     ? 'bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-sm'
                     : 'bg-transparent border-b border-transparent'
                 }`}
    >
      <div className="px-4 flex items-center justify-between h-14">
        <div className="w-1/3 flex justify-start">
          {renderLeftPart()}
        </div>
        
        <div className="w-1/3 flex justify-center">
          {/* Le titre central est maintenant implicite ou géré par la page */}
        </div>

        <div className="w-1/3 flex justify-end">
          {renderRightPart()}
        </div>
      </div>
    </header>
  );
}
