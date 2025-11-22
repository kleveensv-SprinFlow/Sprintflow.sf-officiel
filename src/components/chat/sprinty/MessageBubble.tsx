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
    <div className="flex flex-col max-w-[85%] md:max-w-md">
      {/* Label Sprinty au-dessus de la bulle */}
      {!isUser && (
        <div className="text-xs font-medium text-gray-500 ml-1 mb-1">
          Sprinty
        </div>
      )}
      
      <div
        className={`rounded-2xl px-5 py-4 shadow-sm border leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white border-transparent rounded-br-sm ml-auto'
            : 'bg-[#1E293B] text-gray-100 border-white/5 rounded-bl-sm'
        }`}
      >
        {message.text && (
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-0 prose-headings:text-white prose-strong:text-white prose-a:text-blue-400">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
        {message.component && (
          <div className="mt-3">
            {message.component}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
