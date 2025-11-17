
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import ConversationListItem from './ConversationListItem';

interface Conversation {
  id: string;
  title: string;
  is_pinned: boolean;
}

interface ConversationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onOpenActions: (conversation: Conversation) => void;
}

const ConversationMenu: React.FC<ConversationMenuProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onOpenActions,
}) => {
  const pinnedConversations = conversations.filter(c => c.is_pinned).sort((a, b) => a.title.localeCompare(b.title));
  const recentConversations = conversations.filter(c => !c.is_pinned);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-light-background dark:bg-dark-background z-50 shadow-lg flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold">Conversations</h2>
              <button
                onClick={onNewConversation}
                className="flex items-center justify-center gap-2 mt-4 w-full p-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
              >
                <Plus size={20} />
                <span>Nouvelle Discussion</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {pinnedConversations.length > 0 && (
                <div className="px-2 pb-2">
                  <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">Épinglées</h3>
                  {pinnedConversations.map(convo => (
                    <ConversationListItem
                      key={convo.id}
                      conversation={convo}
                      isActive={convo.id === activeConversationId}
                      onSelect={() => onSelectConversation(convo.id)}
                      onOpenActions={() => onOpenActions(convo)}
                    />
                  ))}
                </div>
              )}

              <div className="px-2">
                <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">Récentes</h3>
                {recentConversations.map(convo => (
                  <ConversationListItem
                    key={convo.id}
                    conversation={convo}
                    isActive={convo.id === activeConversationId}
                    onSelect={() => onSelectConversation(convo.id)}
                    onOpenActions={() => onOpenActions(convo)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConversationMenu;
