import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Trophy, Lightbulb, Settings, Building, Mail, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  userId?: string;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, userRole, userId }) => {
  console.log('SideMenu userRole:', userRole);
  const navigate = useNavigate();
  const location = useLocation();
  const [groupCount, setGroupCount] = useState<number>(0);

  // Récupérer le nombre de groupes de l'athlète
  useEffect(() => {
    const fetchGroupCount = async () => {
      if (userRole === 'athlète' && userId) {
        try {
          const { data, error } = await supabase
            .from('group_members')
            .select('group_id', { count: 'exact', head: false })
            .eq('athlete_id', userId);

          if (!error && data) {
            setGroupCount(data.length);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des groupes:', error);
        }
      }
    };

    if (isOpen) {
      fetchGroupCount();
    }
  }, [isOpen, userRole, userId]);

  const baseMenuItems = [
    { path: '/profile', icon: User, label: 'Mon Profil' },
    { path: '/records', icon: Trophy, label: 'Mes Records' },
  ];

  if (userRole === 'athlète') {
    baseMenuItems.push({ 
      path: '/groups', 
      icon: Users, 
      label: 'Mes Groupes',
      badge: groupCount > 0 ? groupCount : undefined,
      highlighted: true // Pour mettre en évidence cette section
    });
  }

  const menuItems = [
    ...baseMenuItems,
    { path: '/advice', icon: Lightbulb, label: 'Conseil' },
    { path: '/settings', icon: Settings, label: 'Paramètres' },
    { path: '/partnerships', icon: Building, label: 'Partenaires' },
    { path: '/contact', icon: Mail, label: 'Contact' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const menuVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    closed: {
      x: '100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 h-full w-[80%] max-w-sm z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl flex flex-col"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h2 className="text-lg font-bold">Menu</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400 shadow-md scale-105'
                          : item.highlighted
                          ? 'hover:bg-primary-500/10 dark:hover:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                          : 'hover:bg-white/20 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-4" size={22} />
                        <span>{item.label}</span>
                      </div>
                      
                      {/* Badge pour afficher le nombre de groupes */}
                      {item.badge !== undefined && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="min-w-[24px] h-6 px-2 flex items-center justify-center bg-primary-500 text-white text-xs font-bold rounded-full"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Section informative pour les athlètes */}
              {userRole === 'athlète' && groupCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-lg border border-primary-200 dark:border-primary-800"
                >
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-1">
                        Gérer mes groupes
                      </h3>
                      <p className="text-xs text-primary-700 dark:text-primary-300">
                        {groupCount === 1 
                          ? "Vous êtes membre d'1 groupe" 
                          : `Vous êtes membre de ${groupCount} groupes`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Message si pas de groupe */}
              {userRole === 'athlète' && groupCount === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Rejoindre un groupe
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Demandez à votre coach de vous ajouter à un groupe
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;