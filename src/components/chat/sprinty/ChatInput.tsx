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
      // CORRECTION 1: Changement de 'items-end' à 'items-center' pour un centrage vertical propre.
      // CORRECTION 2: Réduction du padding général (px-3 py-2.5) pour une barre plus compacte.
      className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-sprint-dark-surface/90 backdrop-blur-lg px-3 py-2.5 shadow-2xl"
    >
      
      {/* Zone de Saisie Multi-ligne */}
      <textarea
        ref={textareaRef}
        rows={1}
        // CORRECTION 3: Ajustement du padding vertical dans le textarea (py-1 pour centrage)
        className="flex-1 resize-none overflow-y-hidden bg-transparent outline-none text-white placeholder-gray-400 text-base leading-snug py-1"
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
        // L'alignement 'items-center' de la forme gère désormais l'alignement vertical du bouton.
        className={`flex items-center justify-center rounded-full w-10 h-10 transition duration-200 ease-in-out ${
          isSendDisabled 
            ? 'bg-gray-500 opacity-60 cursor-not-allowed' 
            : 'bg-sprint-accent hover:bg-sprint-accent/90'
        }`}
        whileTap={{ scale: 0.9 }}
      >
        <Send size={20} className="text-white" fill="white" />
      </motion.button>
    </form>
  );
};

export default ChatInput;