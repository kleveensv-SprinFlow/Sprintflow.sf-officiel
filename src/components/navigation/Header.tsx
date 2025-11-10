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
}: HeaderProps) {
  const { profile } = useAuth();
  const [isWelcomeVisible, setWelcomeVisible] = useState(showWelcomeMessage && isDashboard);
  const [displayText, setDisplayText] = useState(isWelcomeVisible ? `Bienvenue ${profile?.first_name || 'Athlète'}` : title);

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
        className="absolute text-lg font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap truncate"
      >
        {textContent}
      </motion.h1>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg">
      <div className="px-4 py-3 flex items-center justify-between min-w-0">
        <div className="flex items-center space-x-2 flex-shrink-0 w-1/4">
          {canGoBack ? (
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
              <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          ) : !isDashboard ? (
            <button onClick={onHomeClick} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
              <Home className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          ) : (
            <div className="p-2"><LevelBadge level={0} /></div>
          )}
        </div>
        
        <div className="flex-1 flex justify-center min-w-0 h-6 relative">
          <AnimatePresence mode="wait">
            {renderText()}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0 w-1/4 justify-end">
          {isDashboard && (
            <button onClick={onProfileClick} className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {profile?.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt="Photo de profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}