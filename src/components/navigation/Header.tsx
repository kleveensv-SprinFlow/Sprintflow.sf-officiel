import React, { useState, useEffect } from 'react';
import { Settings, ChevronLeft, User as UserIcon } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

// Définition des nouvelles props pour le Header
interface HeaderProps {
  currentView: 'dashboard' | 'profile' | 'settings';
  onNavigate: (target: 'profile' | 'settings' | 'back') => void;
  isLoading: boolean;
  forceShowBack?: boolean;
}

export default function Header({ currentView, onNavigate, isLoading, forceShowBack }: HeaderProps) {
  const { profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Optimisation Scroll : requestAnimationFrame pour 60fps stable
  useEffect(() => {
    let rafId: number;
    
    const handleScroll = () => {
      // Annule la frame précédente si elle n'a pas encore été exécutée
      cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        // Seuil très bas (10px) pour déclencher l'effet glass immédiatement
        const shouldBeScrolled = window.scrollY > 10;
        
        // Mise à jour de l'état uniquement si changement nécessaire
        setIsScrolled(prev => {
          if (prev !== shouldBeScrolled) {
            return shouldBeScrolled;
          }
          return prev;
        });
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true }); // passive: true pour perf scroll
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Logique d'affichage pour la partie gauche du header
  const renderLeftPart = () => {
    if (currentView === 'dashboard' && !forceShowBack) {
      return (
        <h1 className="text-xl font-extrabold text-white font-manrope tracking-tight">
          SPRINTFLOW
        </h1>
      );
    }
    // Pour les autres vues (ou si forceShowBack est true), on affiche un bouton "Retour"
    return (
      <button
        onClick={() => onNavigate('back')}
        className="p-2 -ml-2 rounded-full transition-colors hover:bg-white/10 text-white"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </button>
    );
  };

  // Logique d'affichage pour la partie droite du header
  const renderRightPart = () => {
    if (currentView === 'dashboard') {
      if (isLoading) {
        return <div className="w-9 h-9 rounded-full bg-gray-700 animate-pulse" />;
      }
      return (
        <button
          onClick={() => onNavigate('profile')}
          className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/20 transition-transform active:scale-95"
        >
          {profile?.photo_url ? (
            <img src={profile.photo_url} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-300" strokeWidth={2} />
            </div>
          )}
        </button>
      );
    }
    if (currentView === 'profile') {
      return (
        <button
          onClick={() => onNavigate('settings')}
          className="p-2 -mr-2 rounded-full transition-colors hover:bg-white/10 text-white"
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
                     ? 'bg-[#0B1120]/90 backdrop-blur-xl border-b border-white/10 shadow-sm'
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
