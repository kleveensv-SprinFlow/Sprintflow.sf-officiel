
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Pin, X } from 'lucide-react';

interface ConversationActionsProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: () => void;
  onPin: () => void;
  isPinned: boolean;
}

const ConversationActions: React.FC<ConversationActionsProps> = ({
  isOpen,
  onClose,
  onRename,
  onPin,
  isPinned,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-light-background dark:bg-dark-background rounded-t-2xl z-50"
          >
            <div className="flex justify-end">
                <button onClick={onClose} className="p-2">
                    <X size={20} />
                </button>
            </div>
            <ul className="space-y-2">
              <li>
                <button onClick={onRename} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-light-card dark:hover:bg-dark-card">
                  <Edit size={20} />
                  <span>Renommer</span>
                </button>
              </li>
              <li>
                <button onClick={onPin} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-light-card dark:hover:bg-dark-card">
                  <Pin size={20} />
                  <span>{isPinned ? 'Détacher' : 'Épingler'}</span>
                </button>
              </li>
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConversationActions;
