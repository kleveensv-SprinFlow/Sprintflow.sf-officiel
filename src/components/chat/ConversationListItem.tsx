import React from 'react';
import { Conversation } from '../../hooks/useConversations';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Users, User } from 'lucide-react';

interface ConversationListItemProps {
  conversation: Conversation;
  onClick: () => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({ conversation, onClick }) => {
  const timeAgo = conversation.last_message_at
    ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true, locale: fr })
    : '';

  const isUnread = conversation.unread_count > 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <div className="relative mr-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {conversation.conversation_photo_url ? (
            <img src={conversation.conversation_photo_url} alt={conversation.conversation_name} className="w-full h-full object-cover" />
          ) : (
            conversation.conversation_type === 'group' ? <Users className="w-6 h-6 text-gray-400" /> : <User className="w-6 h-6 text-gray-400" />
          )}
        </div>
        {isUnread && (
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-primary-500 border-2 border-white dark:border-gray-900"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className={`font-semibold truncate ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
            {conversation.conversation_name}
          </p>
          <p className={`text-xs flex-shrink-0 ml-2 ${isUnread ? 'text-primary-500 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
            {timeAgo}
          </p>
        </div>
        <p className={`text-sm truncate ${isUnread ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
          {conversation.last_message_sender_name && `${conversation.last_message_sender_name}: `}
          {conversation.last_message_content || 'Aucun message'}
        </p>
      </div>
    </div>
  );
};
