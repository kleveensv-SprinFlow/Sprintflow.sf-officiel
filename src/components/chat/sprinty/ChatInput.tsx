import React, { useState, KeyboardEvent, FormEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Logique d'auto-redimensionnement du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120); 
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);


  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;

    onSend(text);
    setValue('');
    
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Soumettre sur Entrée, seulement si Shift n'est PAS pressé
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSendDisabled = disabled || !value.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl px-4 py-3 shadow-lg"
    >
      
      {/* Zone de Saisie Multi-ligne */}
      <textarea
        ref={textareaRef}
        rows={1}
        className="flex-1 resize-none overflow-y-hidden bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base leading-snug py-1"
        placeholder="Écrivez votre question ici..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      {/* Bouton d'Envoi (Accent Color) */}
      <motion.button
        type="submit"
        disabled={isSendDisabled}
        className={`flex items-center justify-center rounded-full w-10 h-10 transition duration-200 ease-in-out shadow-md ${
          isSendDisabled 
            ? 'bg-gray-300 dark:bg-gray-700 opacity-60 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        whileTap={{ scale: 0.9 }}
      >
        <Send size={18} className="text-white" />
      </motion.button>
    </form>
  );
};

export default ChatInput;
