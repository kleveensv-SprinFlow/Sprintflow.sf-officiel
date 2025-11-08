import React, { useState, useEffect } from 'react';
import { ChevronLeft, Home, RefreshCw, User as UserIcon } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import LevelBadge from '../common/LevelBadge';

interface HeaderProps {
  userRole?: 'athlete' | 'coach' | 'developer';
  onRefreshData?: () => void;
  onProfileClick?: () => void;
  onHomeClick?: () => void;
  onMenuClick?: () => void;
  isDashboard: boolean;
  canGoBack?: boolean;
  onBack?: () => void;
  title?: string;
  showWelcome?: boolean;
}

export default function Header({ userRole, onRefreshData, onProfileClick, onHomeClick, onMenuClick, isDashboard, canGoBack, onBack, title, showWelcome = false }: HeaderProps) {
  const { profile } = useAuth();
  const [displayWelcome, setDisplayWelcome] = useState(showWelcome);
  const [isExiting, setIsExiting] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [isLogoEntering, setIsLogoEntering] = useState(false);

  useEffect(() => {
    if (showWelcome) {
      setDisplayWelcome(true);
      setIsExiting(false);
      setShowLogo(false);
      setIsLogoEntering(false);

      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        setShowLogo(true);
        setIsLogoEntering(true);
      }, 4400);

      const hideTimer = setTimeout(() => {
        setDisplayWelcome(false);
      }, 5000);

      const logoAnimationTimer = setTimeout(() => {
        setIsLogoEntering(false);
      }, 5400);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
        clearTimeout(logoAnimationTimer);
      };
    } else {
      setShowLogo(true);
    }
  }, [showWelcome]);

  const handleRefresh = () => {
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const firstName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'Athlète';

  return (
    <header className="sticky top-0 z-30 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg">
      <div className="px-4 py-3 flex items-center justify-between min-w-0">
        <div className="flex items-center space-x-2 flex-shrink-0 w-1/4">
          {canGoBack ? (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Retour"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          ) : !isDashboard ? (
            <button
              onClick={onHomeClick}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Accueil"
            >
              <Home className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          ) : (
            <div className="p-2">
              <LevelBadge level={0} />
            </div>
          )}
        </div>
        
        <div className="flex-1 flex justify-center min-w-0 h-8">
          {isDashboard && displayWelcome && (
            <h1 className={`absolute text-lg font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap ${
              isExiting ? 'animate-welcome-exit' : 'animate-welcome-enter'
            }`}>
              Bonjour {firstName}
            </h1>
          )}
          {isDashboard && showLogo && (
            <img 
              src="https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/public/logo/Logo-sans-fond-sprintflow.png" 
              alt="SprintFlow Logo" 
              className={`h-8 transition-opacity duration-500 ${isLogoEntering ? 'opacity-0' : 'opacity-100'}`}
            />
          )}
          {!isDashboard && (
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate">{title || ''}</h1>
          )}
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0 w-1/4 justify-end">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors hidden xs:block"
            title="Actualiser les données"
          >
            <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>

          {isDashboard && (
            <button
              onClick={onProfileClick}
              className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
              title="Mon Profil"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Photo de profil"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
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