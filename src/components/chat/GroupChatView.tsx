import React, { useState } from 'react';
import { useGroupChat } from '../../hooks/useGroupChat';
import useAuth from '../../hooks/useAuth';
import { MessageCircle, Send, User, Users, Crown, ArrowLeft } from 'lucide-react';
import { Conversation } from '../../hooks/useConversations';

interface GroupChatViewProps {
  conversation: Conversation;
  onBack: () => void;
}

export const GroupChatView: React.FC<GroupChatViewProps> = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { messages, sendMessage } = useGroupChat(conversation.conversation_id);
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    try {
      await sendMessage(messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {conversation.conversation_photo_url ? (
            <img src={conversation.conversation_photo_url} alt={conversation.conversation_name} className="w-full h-full object-cover" />
          ) : (
            <Users className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{conversation.conversation_name}</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Commencez la conversation !</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-xs lg:max-w-md">
                {message.user_id !== user?.id && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden">
                      {message.user_photo ? <img src={message.user_photo} alt={message.user_name} className="w-full h-full object-cover" /> : <User className="h-3 w-3 text-primary-600" />}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{message.user_name}</span>
                    {message.is_coach && <Crown className="h-4 w-4 text-yellow-500" />}
                  </div>
                )}
                <div className={`p-3 rounded-lg ${message.user_id === user?.id ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <p className="text-sm">{message.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Votre message..."
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <button onClick={handleSendMessage} disabled={!messageInput.trim()} className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 p-3 rounded-lg text-white">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
