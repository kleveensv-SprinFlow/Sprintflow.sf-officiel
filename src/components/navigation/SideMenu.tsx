import React from 'react';
import { X } from 'lucide-react';
import { View } from '../../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const menuItems: { label: string; view: View }[] = [
    { label: 'Mes records', view: 'records' },
    { label: 'Mes entraînements', view: 'workouts' },
    { label: 'Composition corporelle', view: 'dashboard' }, // Lien temporaire
    { label: 'Conseils', view: 'ai' },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div
        className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-50 p-6 flex flex-col"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Menu</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.view} className="mb-4">
                <button
                  onClick={() => onNavigate(item.view)}
                  className="w-full text-left text-lg text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default SideMenu;
