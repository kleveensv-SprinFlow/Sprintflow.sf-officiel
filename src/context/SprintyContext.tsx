import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type SprintyExpression = 'neutral' | 'happy' | 'success' | 'thinking' | 'perplexed' | 'caution' | 'frustrated' | 'sleep' | 'typing';

// Définition du type pour un Personnage
export interface Persona {
  id: string;
  name: string;
  role: string;
  themeColor: string;
}

interface SprintyContextType {
  expression: SprintyExpression;
  setExpression: (expr: SprintyExpression) => void;
  isMenuOpen: boolean;
  setMenuOpen: (isOpen: boolean) => void;
  toggleMenu: () => void;
  isThinking: boolean;
  sendMessageToSprinty: (message: string) => Promise<void>;
  
  // Gestion du sélecteur de personnage
  isCharacterSelectorOpen: boolean;
  setCharacterSelectorOpen: (isOpen: boolean) => void;
  toggleCharacterSelector: () => void;

  // Gestion du personnage actif
  currentPersona: Persona;
  setPersona: (persona: Persona) => void;
}

const SprintyContext = createContext<SprintyContextType | undefined>(undefined);

// Personnage par défaut
const DEFAULT_PERSONA: Persona = {
  id: 'sprinty',
  name: 'Sprinty',
  role: 'Assistant Coach IA',
  themeColor: '#4F46E5' // Indigo
};

export const SprintyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expression, setExpression] = useState<SprintyExpression>('neutral');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isCharacterSelectorOpen, setCharacterSelectorOpen] = useState(false);
  const [currentPersona, setPersona] = useState<Persona>(DEFAULT_PERSONA);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const toggleCharacterSelector = () => setCharacterSelectorOpen(prev => !prev);

  const sendMessageToSprinty = async (message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsThinking(true);
      setExpression('perplexed'); 

      // On sauvegarde le message
      const { error: msgError } = await supabase
        .from('individual_chat_messages')
        .insert({
          sender_id: user.id,
          receiver_id: '00000000-0000-0000-0000-000000000000', // Sprinty ID
          message: message
        });

      if (msgError) throw msgError;

      // On appelle l'IA avec le contexte du personnage actuel
      const { error: fnError } = await supabase.functions.invoke('sprinty-brain', {
        body: { 
          user_id: user.id, 
          message,
          persona: currentPersona.id // On envoie l'ID du personnage à l'IA
        }
      });

      if (fnError) throw fnError;

    } catch (error) {
      console.error("Error talking to Sprinty:", error);
      setExpression('frustrated');
    } finally {
      setIsThinking(false);
      setExpression('neutral');
    }
  };

  return (
    <SprintyContext.Provider value={{ 
      expression, 
      setExpression, 
      isMenuOpen, 
      setMenuOpen, 
      toggleMenu,
      isThinking,
      sendMessageToSprinty,
      isCharacterSelectorOpen,
      setCharacterSelectorOpen,
      toggleCharacterSelector,
      currentPersona,
      setPersona
    }}>
      {children}
    </SprintyContext.Provider>
  );
};

export const useSprinty = () => {
  const context = useContext(SprintyContext);
  if (context === undefined) {
    throw new Error('useSprinty must be used within a SprintyProvider');
  }
  return context;
};