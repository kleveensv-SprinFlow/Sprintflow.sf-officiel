import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Trophy, Lightbulb, Settings, Building, Mail } from 'lucide-react';
import { View } from '../../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentView: (view: View) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, setCurrentView }) => {
  const menuItems = [
    { view: 'profile' as View, icon: User, label: 'Mon Profil' },
    { view: 'records' as View, icon: Trophy, label: 'Mes Records' },
    { view: 'advice' as View, icon: Lightbulb, label: 'Conseil' },
    { view: 'settings' as View, icon: Settings, label: 'Paramètres' },
    { view: 'partners' as View, icon: Building, label: 'Partenaires' },
    { view: 'contact' as View, icon: Mail, label: 'Contact' },
  ];

  const handleNavigation = (view: View) => {
    // Pour les vues non implémentées, on ne fait rien pour l'instant
    const implementedViews: View[] = ['profile', 'records'];
    if (implementedViews.includes(view)) {
      setCurrentView(view);
      onClose();
    }
    // Idéalement, afficher un toast pour informer l'utilisateur plus tard
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
                  <li key={item.view}>
                    <button
                      onClick={() => handleNavigation(item.view)}
                      className="w-full flex items-center p-3 rounded-lg text-base font-semibold hover:bg-white/20 dark:hover:bg-gray-800/60 transition-colors duration-200"
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
