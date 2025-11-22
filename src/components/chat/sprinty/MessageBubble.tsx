import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'sprinty';
    component?: React.ReactNode;
  };
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className="relative max-w-[85%] md:max-w-md">
      {/* Affichage du nom (Optionnel, pour plus de clarté) */}
      <div className={`text-xs mb-1 px-2 opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>
        {isUser ? 'Moi' : 'Sprinty'}
      </div>

      <div
        className={`rounded-2xl px-5 py-3.5 shadow-sm backdrop-blur-md border ${
          isUser
            ? 'bg-blue-600/90 border-blue-500/50 text-white rounded-br-sm ml-auto'
            : 'bg-white/70 dark:bg-white/15 border-white/40 dark:border-white/20 text-gray-800 dark:text-gray-100 rounded-bl-sm'
        }`}
      >
        {message.text && (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0 leading-relaxed break-words">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
        {message.component && (
          <div className="mt-3 p-2 bg-black/5 rounded-lg">
            {message.component}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
