import React from 'react';
import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'sprinty';
  };
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
      )}
      <div
        className={`px-4 py-2.5 rounded-2xl max-w-xs md:max-w-md lg:max-w-lg shadow-sm ${
          isUser
            ? 'bg-accent text-white rounded-br-none'
            : 'bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text rounded-bl-none'
        }`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
