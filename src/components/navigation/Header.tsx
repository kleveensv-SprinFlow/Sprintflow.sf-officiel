import React from 'react';
import { ChevronLeft, Home, RefreshCw, Crown, User as UserIcon, Menu } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

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
}

export default function Header({ userRole, onRefreshData, onProfileClick, onHomeClick, onMenuClick, isDashboard, canGoBack, onBack, title }: HeaderProps) {
  const { profile } = useAuth();

  const handleRefresh = () => {
    if (onRefreshData) {
      onRefreshData();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg">
      <div className="px-4 py-3 flex items-center justify-between min-w-0">
        <div className="flex items-center space-x-2 flex-shrink-0 w-1/4">
          {userRole === 'athlete' ? (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          ) : (
            <>
              {canGoBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Retour"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </button>
              )}
              {!isDashboard && !canGoBack && (
                <button
                  onClick={onHomeClick}
                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Accueil"
                >
                  <Home className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="flex-1 flex justify-center min-w-0">
          {isDashboard && !canGoBack ? (
            <div className="flex items-center space-x-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              {(userRole === 'coach' || userRole === 'developer') ? (
                <>
                  <Crown className="w-4 h-4 text-secondary-500" />
                  <span>{userRole === 'developer' ? 'Développeur' : 'Coach'}</span>
                </>
              ) : (
                <>
                  <UserIcon className="w-4 h-4 text-primary-500" />
                  <span>Athlète</span>
                </>
              )}
            </div>
          ) : (
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