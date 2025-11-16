import React from 'react';
import { MessageSquare } from 'lucide-react';

interface Conversation {
  conversation_id: string;
  conversation_type: 'group' | 'individual';
  name?: string | null;
  last_activity?: string;
  unread_count?: number;
}

interface ConversationListItemProps {
  conversation: Conversation;
  onClick: () => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  onClick,
}) => {
  const displayName = conversation.name || 'Conversation sans nom';
  const lastActivity = conversation.last_activity
    ? new Date(conversation.last_activity).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : 'N/A';

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-4 hover:bg-sprint-light-surface dark:hover:bg-sprint-dark-surface rounded-xl cursor-pointer transition-colors"
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-sprint-accent/10 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-sprint-accent" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sprint-light-text-primary dark:text-sprint-dark-text-primary truncate">
          {displayName}
        </p>
        <p className="text-sm text-sprint-light-text-secondary dark:text-sprint-dark-text-secondary">
          {lastActivity}
        </p>
      </div>
      {conversation.unread_count && conversation.unread_count > 0 && (
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-sprint-accent rounded-full">
            {conversation.unread_count}
          </span>
        </div>
      )}
    </div>
  );
};
