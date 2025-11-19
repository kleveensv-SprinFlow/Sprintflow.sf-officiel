import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Trophy, Lightbulb, Settings, Building, Mail, Users } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const baseMenuItems = [
    { path: '/profile', icon: User, label: 'Mon Profil' },
    { path: '/records', icon: Trophy, label: 'Mes Records' },
  ];

  if (userRole === 'athlète') {
    baseMenuItems.push({ path: '/groups', icon: Users, label: 'Mon Groupe' });
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
                      className={`w-full flex items-center p-3 rounded-lg text-base font-semibold transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
                          : 'hover:bg-white/20 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <item.icon className="mr-4" size={22} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;
