import React, { useState, useEffect } from 'react';
import ConversationSidebar from './ConversationSidebar';
import MessageView from './MessageView'; // Je vais créer ce composant juste après
import { useConversations } from '../../hooks/useConversations';
import { Menu } from 'lucide-react';
import { Conversation } from '../../types';

const ChatManager: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { createConversation, conversations } = useConversations();

  // Sélectionner la première conversation au chargement ou si aucune n'est active
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const handleCreateConversation = async (): Promise<Conversation | null> => {
    const { data } = await createConversation();
    if (data) {
      setActiveConversationId(data.id);
      setSidebarOpen(false); // Fermer la sidebar après la création
      return data;
    }
    return null;
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
  };
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <ConversationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectConversation={handleSelectConversation}
        onCreateConversation={handleCreateConversation}
        activeConversationId={activeConversationId}
      />

      <main className="flex-1 flex flex-col transition-all duration-300">
        <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold ml-4 truncate">
            {activeConversation ? activeConversation.title : 'Sprinty Chat'}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <MessageView conversationId={activeConversationId} />
        </div>
      </main>
    </div>
  );
};

export default ChatManager;
