import React, { useState, KeyboardEvent, FormEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

// --- PLACEHOLDER ---
// Ce composant placeholder sera remplacé par le véritable SprintyAvatar (qui gère l'animation)
const SprintyAvatarPlaceholder = () => (
  <div className="flex-shrink-0 pt-2 flex items-start">
    <div className="h-8 w-8 rounded-full bg-sprint-accent/20 flex items-center justify-center">
      {/* Placeholder pour l'icône BrainCircuit ou la tête du léopard */}
      <span className="text-xs text-sprint-accent font-semibold">IA</span>
    </div>
  </div>
);
// -------------------

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
      textareaRef.current.style.height = 'auto'; // Réinitialiser la hauteur
      // Limiter la hauteur maximale (env. 5 lignes) pour ne pas cacher tout l'écran
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
    
    // Réinitialiser la hauteur après l'envoi
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Soumettre sur Entrée, seulement si Shift n'est PAS pressé (permet Shift+Enter pour nouvelle ligne)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSendDisabled = disabled || !value.trim();

  return (
    <form
      onSubmit={handleSubmit}
      // Nouveau style : barre ancrée, coins arrondis
      className="flex w-full items-end gap-2 rounded-2xl border border-white/10 bg-sprint-dark-surface/90 backdrop-blur-lg p-3 shadow-2xl"
    >
      {/* 1. Slot pour l'Avatar (positionné en haut du champ pour l'alignement) */}
      <SprintyAvatarPlaceholder /> 
      
      {/* 2. Zone de Saisie Multi-ligne */}
      <textarea
        ref={textareaRef}
        rows={1} // Commence sur une ligne
        className="flex-1 resize-none overflow-y-hidden bg-transparent outline-none text-white placeholder-gray-400 text-base leading-snug pt-2 pb-1"
        placeholder="Écrivez votre question ici..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      {/* 3. Bouton d'Envoi (Accent Color) */}
      <motion.button
        type="submit"
        disabled={isSendDisabled}
        // Utilisation de la couleur d'accentuation pour le fond du bouton
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