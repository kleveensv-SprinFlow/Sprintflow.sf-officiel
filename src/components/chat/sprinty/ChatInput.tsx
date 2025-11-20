import React, { useState, KeyboardEvent, FormEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;

    onSend(text);   // déclenche l’envoi
    setValue('');   // vide le champ
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-2"
    >
      <input
        type="text"
        className="flex-1 bg-transparent outline-none text-light-text dark:text-dark-text placeholder-gray-500 text-sm"
        placeholder="Que puis-je analyser pour vous aujourd'hui ?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex items-center justify-center rounded-full w-8 h-8 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <Send size={16} className="text-white" />
      </button>
    </form>
  );
};

export default ChatInput;