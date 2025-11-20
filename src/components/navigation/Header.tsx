import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Home, User as UserIcon } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import LevelBadge from '../common/LevelBadge';

interface HeaderProps {
  userRole?: 'athlete' | 'coach' | 'developer';
  onProfileClick?: () => void;
  onHomeClick?: () => void;
  isDashboard: boolean;
  canGoBack?: boolean;
  onBack?: () => void;
  title: string;
  showWelcomeMessage: boolean;
}

export default function Header({
  onProfileClick,
  onHomeClick,
  isDashboard,
  canGoBack,
  onBack,
  title,
  showWelcomeMessage,
  userRole,
}: HeaderProps) {
  const { profile } = useAuth();
  const isAthlete = userRole === 'athlete';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWelcomeVisible, setWelcomeVisible] = useState(showWelcomeMessage && isDashboard);
  const [displayText, setDisplayText] = useState(
    isWelcomeVisible ? `Bienvenue ${profile?.first_name || 'Athlète'}` : title,
  );

  // Gestion du scroll pour l'effet "Glassmorphism" progressif
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Affiche un message de bienvenue uniquement sur le tableau de bord
  useEffect(() => {
    if (showWelcomeMessage && isDashboard) {
      const firstName = profile?.first_name || 'Athlète';
      setDisplayText(`Bienvenue ${firstName}`);
      setWelcomeVisible(true);
      const timer = setTimeout(() => {
        setWelcomeVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setWelcomeVisible(false);
      setDisplayText(title);
    }
  }, [showWelcomeMessage, isDashboard, profile?.first_name, title]);

  // Quand le message disparaît, on affiche le titre de la page
  useEffect(() => {
    if (!isWelcomeVisible) {
      setDisplayText(title);
    }
  }, [isWelcomeVisible, title]);

  const renderText = () => {
    const firstName = profile?.first_name || 'Athlète';
    const textContent = isWelcomeVisible ? (
      <>
        Bienvenue <span className="animate-shine">{firstName}</span>
      </>
    ) : (
      displayText
    );
    return (
      <motion.h1
        key={displayText}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className={`text-[17px] font-semibold tracking-tight whitespace-nowrap truncate transition-colors duration-300 ${
           isScrolled 
             ? 'text-sprint-light-text-primary dark:text-white' 
             : 'text-sprint-light-text-primary dark:text-white'
        }`}
      >
        {textContent}
      </motion.h1>
    );
  };

  // Pour les athlètes ou sur le tableau de bord, on affiche toujours le badge et la photo
  const showBadge = isDashboard || isAthlete;
  const showAvatar = isDashboard || isAthlete;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 py-3'
          : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <div className="px-4 flex items-center justify-between min-w-0">
        {/* Partie Gauche */}
        <div className="flex items-center space-x-2 flex-shrink-0 w-1/4">
          {showBadge ? (
            <div className="origin-left scale-90">
               <LevelBadge level={0} />
            </div>
          ) : canGoBack ? (
            <button 
              onClick={onBack} 
              className={`p-2 -ml-2 rounded-full transition-colors ${
                isScrolled 
                  ? 'hover:bg-black/5 dark:hover:bg-white/10' 
                  : 'bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-sm'
              }`}
            >
              <ChevronLeft className="h-6 w-6 text-current" strokeWidth={1.5} />
            </button>
          ) : !isDashboard ? (
            <button 
              onClick={onHomeClick} 
              className={`p-2 -ml-2 rounded-full transition-colors ${
                isScrolled 
                  ? 'hover:bg-black/5 dark:hover:bg-white/10' 
                  : 'bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-sm'
              }`}
            >
              <Home className="h-5 w-5 text-current" strokeWidth={1.5} />
            </button>
          ) : (
             <div className="origin-left scale-90">
               <LevelBadge level={0} />
            </div>
          )}
        </div>

        {/* Titre Central */}
        <div className="flex-1 flex justify-center min-w-0 h-6 relative overflow-hidden">
          <AnimatePresence mode="wait">{renderText()}</AnimatePresence>
        </div>

        {/* Partie Droite (Avatar / Menu) */}
        <div className="flex items-center space-x-2 flex-shrink-0 w-1/4 justify-end">
          {showAvatar && (
            <button
              onClick={onProfileClick}
              className={`relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 transition-transform active:scale-95 ${
                !isScrolled ? 'shadow-lg' : ''
              }`}
            >
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                   <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
