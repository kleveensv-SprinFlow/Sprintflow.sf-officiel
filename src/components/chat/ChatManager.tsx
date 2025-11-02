import React, { useState } from 'react';
import { ConversationList } from './ConversationList';
import { GroupChatView } from './GroupChatView';
import { IndividualChatView } from './IndividualChatView';
import { useConversations, Conversation } from '../../hooks/useConversations';

type ChatView = 'groups' | 'individuals';

export const ChatManager: React.FC = () => {
  const [currentView, setCurrentView] = useState<ChatView>('groups');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { conversations } = useConversations();

  const handleConversationSelect = (id: string) => {
    const conversation = conversations.find(c => c.conversation_id === id);
    if (conversation) {
      setSelectedConversation(conversation);
    }
  };

  if (selectedConversation) {
    if (selectedConversation.conversation_type === 'group') {
      return <GroupChatView conversation={selectedConversation} onBack={() => setSelectedConversation(null)} />;
    }
    if (selectedConversation.conversation_type === 'individual') {
      return <IndividualChatView conversation={selectedConversation} onBack={() => setSelectedConversation(null)} />;
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messagerie</h1>
        <p className="text-gray-600 dark:text-gray-400">Vos conversations avec vos athlètes et groupes.</p>
      </div>

      <div className="flex px-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setCurrentView('groups')}
          className={`px-4 py-3 font-medium transition-colors duration-200 ${
            currentView === 'groups'
              ? 'border-b-2 border-primary-500 text-primary-500'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Groupes
        </button>
        <button
          onClick={() => setCurrentView('individuals')}
          className={`px-4 py-3 font-medium transition-colors duration-200 ${
            currentView === 'individuals'
              ? 'border-b-2 border-primary-500 text-primary-500'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Individuel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {currentView === 'groups' && (
          <ConversationList
            type="group"
            onConversationSelect={handleConversationSelect}
          />
        )}
        {currentView === 'individuals' && (
          <ConversationList
            type="individual"
            onConversationSelect={handleConversationSelect}
          />
        )}
      </div>
    </div>
  );
};
