import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Scale, Moon, X } from 'lucide-react';

interface FabMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

const FabMenu: React.FC<FabMenuProps> = ({ isOpen, onClose, onAction }) => {
  const actions = [
    { id: 'record', label: 'Nouveau Record', icon: Trophy, color: 'bg-yellow-500' },
    { id: 'workout', label: 'Ajouter une Séance', icon: Calendar, color: 'bg-blue-500' },
    { id: 'weight', label: 'Ajouter une Pesée', icon: Scale, color: 'bg-green-500' },
    { id: 'sleep', label: 'Ajouter le Sommeil', icon: Moon, color: 'bg-indigo-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Menu Items */}
          <div className="fixed bottom-[100px] left-0 right-0 z-50 flex flex-col items-center space-y-4 pointer-events-none">
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => {
                  onAction(action.id);
                  onClose();
                }}
                className="pointer-events-auto flex items-center space-x-4 group"
              >
                 {/* Label */}
                 <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-semibold shadow-lg transform transition-transform group-hover:scale-105">
                  {action.label}
                </span>

                {/* Icon Circle */}
                <div className={`${action.color} p-3 rounded-full text-white shadow-lg shadow-black/20 transform transition-transform group-hover:scale-110`}>
                  <action.icon size={24} strokeWidth={2} />
                </div>
               
              </motion.button>
            ))}
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FabMenu;
