import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversations } from '../../hooks/useConversations';
import { ConversationListItem } from './ConversationListItem';
import { PlusCircle, Loader } from 'lucide-react';

const ConversationHistoryView = () => {
  const navigate = useNavigate();
  const { 
    conversations, 
    loading, 
    error, 
    createConversation, 
    renameConversation, 
    pinConversation, 
    deleteConversation 
  } = useConversations();

  const handleSelect = (id: string) => {
    navigate(`/sprinty/${id}`);
  };

  const handleCreateNew = () => {
    const newName = prompt("Entrez un nom pour la nouvelle conversation (optionnel) :");
    createConversation(newName || undefined);
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader className="animate-spin" /></div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Historique</h1>
        <button onClick={handleCreateNew} className="flex items-center gap-2 text-blue-500">
          <PlusCircle size={20} />
          <span>Nouvelle</span>
        </button>
      </div>
      <div className="space-y-2">
        {conversations.map(conv => (
          <ConversationListItem
            key={conv.id}
            conversation={conv}
            onClick={() => handleSelect(conv.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationHistoryView;
