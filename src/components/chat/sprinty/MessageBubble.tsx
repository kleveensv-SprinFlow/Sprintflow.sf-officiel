import React from 'react';
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
    <div
      className={`px-4 py-3 rounded-2xl max-w-md md:max-w-lg shadow-md ${
        isUser
          ? 'bg-blue-500 text-white rounded-br-lg'
          : 'bg-gray-200 dark:bg-gray-700 text-light-text dark:text-dark-text rounded-bl-lg'
      }`}
    >
      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0">
        <ReactMarkdown>{message.text}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MessageBubble;
