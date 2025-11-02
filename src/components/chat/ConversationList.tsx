import React from 'react';
import { useConversations } from '../../hooks/useConversations';
import { Loader2, MessageSquare } from 'lucide-react';
import { ConversationListItem } from './ConversationListItem';

interface ConversationListProps {
  onConversationSelect: (conversationId: string) => void;
  type: 'group' | 'individual';
}

export const ConversationList: React.FC<ConversationListProps> = ({ onConversationSelect, type }) => {
  const { conversations, loading, error } = useConversations();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-primary-500 h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Erreur lors du chargement des conversations.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  const filteredConversations = conversations.filter(c => c.conversation_type === type);

  if (filteredConversations.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
        <MessageSquare className="h-12 w-12 mx-auto mb-4" />
        <p>Aucune conversation {type === 'group' ? 'de groupe' : 'individuelle'} pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredConversations.map(conversation => (
        <ConversationListItem
          key={conversation.conversation_id}
          conversation={conversation}
          onClick={() => onConversationSelect(conversation.conversation_id)}
        />
      ))}
    </div>
  );
};
