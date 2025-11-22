import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import useAuth from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import LevelBadge from '../common/LevelBadge';

interface HeaderProps {
  userRole?: 'athlete' | 'coach' | 'developer';
  onProfileClick?: () => void;
  onHomeClick?: () => void; // kept for interface compatibility but unused
  isDashboard: boolean;
  canGoBack?: boolean;
  onBack?: () => void;
  title: string;
  showWelcomeMessage: boolean;
  customColor?: string; // Added prop for custom theme color
}

export default function Header({
  onProfileClick,
  isDashboard,
  canGoBack,
  onBack,
  title,
  showWelcomeMessage,
  userRole,
  customColor,
}: HeaderProps) {
  const { profile } = useAuth();
  const { groups, coachAthletes } = useGroups();
  const [selection] = useLocalStorage<{ type: 'athlete' | 'group'; name: string; id: string; color?: string } | null>('coach-dashboard-selection', null);
  
  const isAthlete = userRole === 'athlete';
  const isCoachDashboard = isDashboard && userRole === 'coach';

  const [isScrolled, setIsScrolled] = useState(false);
  const [isWelcomeVisible, setWelcomeVisible] = useState(showWelcomeMessage && isDashboard);
  const [displayText, setDisplayText] = useState(
    isWelcomeVisible ? `Bienvenue ${profile?.first_name || 'Athlète'}` : title,
  );

  // Special override for "Gestion des suivis" title on Groups page
  const isGroupsPage = window.location.pathname.includes('/groups');
  
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

  useEffect(() => {
    if (showWelcomeMessage && isDashboard && !isCoachDashboard) {
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
  }, [showWelcomeMessage, isDashboard, profile?.first_name, title, isCoachDashboard]);

  useEffect(() => {
    if (!isWelcomeVisible) {
      setDisplayText(title);
    }
  }, [isWelcomeVisible, title]);

  const renderText = () => {
    const firstName = profile?.first_name || 'Athlète';
    
    // Logic for Group Management Page Title (Aligned Left, Standard Text)
    if (isGroupsPage) {
       // Logic handled in render structure below (no center title)
       return null;
    }

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
        className={`text-[17px] font-bold tracking-tight whitespace-nowrap truncate transition-colors duration-300 text-sprint-light-text-primary dark:text-white`}
      >
        {textContent}
      </motion.h1>
    );
  };

  const showBadge = (isDashboard && !isCoachDashboard) || isAthlete;
  const showAvatar = isDashboard || isAthlete || isGroupsPage;

  // Helper to generate gradient text style
  const getGradientStyle = (hexColor: string) => ({
    backgroundImage: `linear-gradient(to right, ${hexColor}, #FFFFFF, ${hexColor})`,
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'shine 3s linear infinite',
  });

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 py-3 shadow-sm'
          : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <div className="px-4 flex items-center justify-between min-w-0">
        {/* Partie Gauche */}
        <div className={`flex items-center space-x-2 flex-shrink-0 ${isCoachDashboard || isGroupsPage ? 'flex-1' : 'w-1/4'}`}>
          {isGroupsPage ? (
             <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des suivis</h1>
          ) : isCoachDashboard ? (
            // Logique spécifique Header Coach Dashboard
            selection ? (
              <div className="flex items-center overflow-hidden">
                <span className="text-gray-600 dark:text-gray-300 mr-2 text-[15px] font-semibold whitespace-nowrap hidden md:inline">
                  {selection.type === 'group' ? 'Groupe' : 'Athlète'}
                </span>
                <span 
                  className="text-[17px] font-extrabold truncate"
                  style={selection.color ? getGradientStyle(selection.color) : undefined}
                >
                  {selection.name}
                </span>
              </div>
            ) : (
               (!groups || groups.length === 0) && (!coachAthletes || coachAthletes.length === 0) ? (
                  <Link to="/groups" className="text-sm font-bold text-accent hover:underline whitespace-nowrap animate-pulse">
                    Créer mon premier groupe
                  </Link>
               ) : null 
            )
          ) : showBadge ? (
            <div className="origin-left scale-90">
              {profile && profile.level !== undefined ? (
                 <LevelBadge level={profile.level} />
              ) : (
                <div className="w-8 h-8"></div> // Placeholder
              )}
            </div>
          ) : canGoBack ? (
            <button 
              onClick={onBack} 
              className={`p-2 -ml-2 rounded-full transition-colors ${
                isScrolled 
                  ? 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-white' 
                  : 'bg-white/20 backdrop-blur-md hover:bg-white/30 shadow-sm text-gray-800 dark:text-white'
              }`}
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2} />
            </button>
          ) : (
             // Removed Home button logic entirely for cleaner look
             <div className="origin-left scale-90">
               {profile && profile.level !== undefined ? (
                  <LevelBadge level={profile.level} />
               ) : (
                 <div className="w-8 h-8"></div> 
               )}
            </div>
          )}
        </div>

        {/* Titre Central - Masqué sur le Dashboard Coach et Groups Page */}
        {!isCoachDashboard && !isGroupsPage && (
          <div className="flex-1 flex justify-center min-w-0 h-6 relative overflow-hidden">
            <AnimatePresence mode="wait">{renderText()}</AnimatePresence>
          </div>
        )}

        {/* Partie Droite (Avatar / Menu) */}
        <div className="flex items-center space-x-2 flex-shrink-0 w-1/4 justify-end">
          {showAvatar && (
            <button
              onClick={onProfileClick}
              className={`relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/20 transition-transform active:scale-95 ${
                !isScrolled ? 'shadow-lg' : ''
              }`}
            >
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                   <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" strokeWidth={2} />
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
