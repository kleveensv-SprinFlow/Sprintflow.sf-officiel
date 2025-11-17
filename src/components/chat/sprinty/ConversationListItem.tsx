
import React from 'react';
import { MoreVertical } from 'lucide-react';

interface ConversationListItemProps {
  conversation: {
    id: string;
    title: string;
  };
  isActive: boolean;
  onSelect: () => void;
  onOpenActions: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onOpenActions,
}) => {
  const truncatedTitle = conversation.title.length > 35 
    ? `${conversation.title.substring(0, 35)}...` 
    : conversation.title;

  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-light-card dark:hover:bg-dark-card ${isActive ? 'bg-light-card dark:bg-dark-card' : ''}`}
    >
      <div className="flex items-center gap-3">
        {isActive && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
        <span className="text-sm font-medium">{truncatedTitle}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenActions();
        }}
        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <MoreVertical size={18} />
      </button>
    </div>
  );
};

export default ConversationListItem;
