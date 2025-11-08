import React from 'react';
import { X, User, BarChart2, Lightbulb, LogOut, Users, Settings, Handshake, Mail } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { View } from '../../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const { profile, signOut } = useAuth();

  const handleNavigation = (view: View) => {
    onNavigate(view);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-xs bg-white dark:bg-gray-800 shadow-lg z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="flex-grow p-4 space-y-4">
              <div 
                className="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleNavigation('profile')}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profil" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{profile?.first_name || 'Mon Profil'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Voir le profil</p>
                </div>
              </div>

              <nav className="space-y-2 flex-grow flex flex-col">
                {profile?.role === 'athlete' && (
                  <button
                    onClick={() => handleNavigation('groups')}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    <span>Mon groupe</span>
                  </button>
                )}
                <button
                  onClick={() => handleNavigation('records')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <BarChart2 className="w-5 h-5" />
                  <span>Mes records</span>
                </button>
                <button
                  onClick={() => handleNavigation('ai')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Lightbulb className="w-5 h-5" />
                  <span>Conseil</span>
                </button>
                <button
                  onClick={() => handleNavigation('settings')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Paramètres</span>
                </button>
                <button
                  onClick={() => handleNavigation('partnerships')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Handshake className="w-5 h-5" />
                  <span>Partenaires</span>
                </button>
                <div className="flex-grow" />
                <button
                  onClick={() => handleNavigation('contact')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>Contact</span>
                </button>
              </nav>
            </div>

            <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => signOut()}
                className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;
