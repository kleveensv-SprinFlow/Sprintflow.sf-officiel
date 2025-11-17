import React from 'react';
import { useConversations } from '../../hooks/useConversations';
import { Conversation } from '../../types';
import { PlusCircle } from 'lucide-react';

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => Promise<Conversation | null>;
  activeConversationId: string | null;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  onCreateConversation,
  activeConversationId,
}) => {
  const { conversations, loading, error } = useConversations();

  const handleCreateConversation = async () => {
    const newConversation = await onCreateConversation();
    if (newConversation) {
      onSelectConversation(newConversation.id);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-30 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Historique</h2>
          <button
            onClick={handleCreateConversation}
            className="flex items-center justify-center w-full px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Nouvelle Discussion
          </button>
          <div className="mt-4 space-y-2">
            {loading && <p className="text-gray-500 dark:text-gray-400">Chargement...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {conversations.map((convo) => (
              <div
                key={convo.id}
                onClick={() => onSelectConversation(convo.id)}
                className={`p-2 rounded-md cursor-pointer ${
                  activeConversationId === convo.id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{convo.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationSidebar;
