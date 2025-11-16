import React from 'react';
import { Pin, Trash2, Edit } from 'lucide-react';
import { Conversation } from '../../../types'; // Assuming Conversation type exists

interface ConversationListItemProps {
  conversation: Conversation;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onPin: (id: string, isPinned: boolean) => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  onSelect,
  onDelete,
  onRename,
  onPin,
}) => {
  const handleRename = () => {
    const newName = prompt("Entrez le nouveau nom de la conversation :", conversation.name || '');
    if (newName) {
      onRename(conversation.id, newName);
    }
  };

  return (
    <div className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
      <div className="flex-1" onClick={() => onSelect(conversation.id)}>
        <p className="font-semibold">{conversation.name || 'Conversation sans nom'}</p>
        <p className="text-sm text-gray-500">
          Dernière activité: {new Date(conversation.last_activity).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onPin(conversation.id, !conversation.pinned)} className={conversation.pinned ? 'text-blue-500' : ''}>
          <Pin size={18} />
        </button>
        <button onClick={handleRename}>
          <Edit size={18} />
        </button>
        <button onClick={() => onDelete(conversation.id)} className="text-red-500">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default ConversationListItem;
