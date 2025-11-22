import React, { useState, useEffect, useRef } from 'react';
import { useIndividualChat } from '../../hooks/useIndividualChat';
import useAuth from '../../hooks/useAuth';
import { MessageCircle, Send, User, ArrowLeft, Sparkles } from 'lucide-react';
import { Conversation } from '../../hooks/useConversations';
import { useSprinty } from '../../context/SprintyContext';

interface IndividualChatViewProps {
  conversation: Conversation;
  onBack: () => void;
}

export const IndividualChatView: React.FC<IndividualChatViewProps> = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { messages, sendMessage } = useIndividualChat(conversation.partner_id || null);
  const [messageInput, setMessageInput] = useState('');
  const { isThinking, sendMessageToSprinty } = useSprinty();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if this is a chat with Sprinty
  const isSprintyChat = conversation.partner_id === '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    const msg = messageInput;
    setMessageInput(''); // Clear immediately for better UX

    try {
      if (isSprintyChat) {
        // Use Sprinty context logic
        await sendMessageToSprinty(msg);
      } else {
        // Normal chat logic
        await sendMessage(msg);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setMessageInput(msg); // Restore on error
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
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{conversation.conversation_name}</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Commencez la conversation !</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-xs lg:max-w-md">
                {message.sender_id !== user?.id && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden">
                      {message.sender_photo ? <img src={message.sender_photo} alt={message.sender_name} className="w-full h-full object-cover" /> : <User className="h-3 w-3 text-primary-600" />}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{message.sender_name}</span>
                  </div>
                )}
                <div className={`p-3 rounded-lg ${message.sender_id === user?.id ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Thinking Indicator */}
      {isThinking && isSprintyChat && (
         <div className="px-4 pb-2">
           <div className="flex items-center space-x-2 animate-pulse">
             <div className="relative">
               <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-40 animate-pulse"></div>
               <Sparkles className="relative w-5 h-5 text-sprint-primary dark:text-blue-400" />
             </div>
             <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-sprint-primary to-purple-600 dark:from-blue-400 dark:to-purple-400">
               Sprinty réfléchit...
             </span>
           </div>
         </div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isThinking ? "Sprinty réfléchit..." : "Votre message..."}
            disabled={isThinking}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          />
          <button 
            onClick={handleSendMessage} 
            disabled={!messageInput.trim() || isThinking} 
            className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 p-3 rounded-lg text-white transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
