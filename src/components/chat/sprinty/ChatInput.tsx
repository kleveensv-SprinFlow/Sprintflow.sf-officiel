import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="p-2 bg-light-background dark:bg-dark-background">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-1 rounded-full bg-light-card dark:bg-dark-card border border-white/10 shadow-md">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Que puis-je analyser pour vous ?"
          className="flex-1 w-full px-4 py-2 bg-transparent focus:outline-none text-light-text dark:text-dark-text placeholder-gray-500"
        />
        <motion.button
          type="submit"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white"
          whileTap={{ scale: 0.9 }}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </form>
    </div>
  );
};

export default ChatInput;