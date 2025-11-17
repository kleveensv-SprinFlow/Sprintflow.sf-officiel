import React, { useState } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { Send } from 'lucide-react';

interface MessageViewProps {
  conversationId: string | null;
}

const MessageView: React.FC<MessageViewProps> = ({ conversationId }) => {
  const { messages, loading, error, addMessage } = useMessages(conversationId);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !conversationId) return;

    setNewMessage('');

    // 1. Enregistrer le message de l'utilisateur
    await addMessage(content, 'user');

    // 2. Simuler et enregistrer la réponse de Sprinty
    // Un petit délai pour simuler une "réflexion"
    setTimeout(async () => {
      const sprintyResponse = "J'ai bien reçu votre requête. Je lance l'analyse de vos données...";
      await addMessage(sprintyResponse, 'assistant');
    }, 500);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Chargement...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;
  }
  
  if (!conversationId) {
     return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center text-gray-500">
          <p>Sélectionnez une conversation ou commencez-en une nouvelle.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 overflow-y-auto pr-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            <div
              className={`max-w-md p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Posez votre question à Sprinty..."
          className="flex-1 p-2 border rounded-l-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
          disabled={!newMessage.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageView;
