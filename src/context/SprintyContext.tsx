import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth'; // Assuming this hook exists

export type SprintyExpression = 'neutral' | 'happy' | 'success' | 'thinking' | 'perplexed' | 'caution' | 'frustrated' | 'sleep' | 'typing';

interface SprintyContextType {
  expression: SprintyExpression;
  setExpression: (expr: SprintyExpression) => void;
  isMenuOpen: boolean;
  setMenuOpen: (isOpen: boolean) => void;
  toggleMenu: () => void;
  isThinking: boolean;
  sendMessageToSprinty: (message: string) => Promise<void>;
}

const SprintyContext = createContext<SprintyContextType | undefined>(undefined);

export const SprintyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expression, setExpression] = useState<SprintyExpression>('neutral');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  // We can't use useAuth here easily if SprintyProvider is outside AuthProvider.
  // Assuming SprintyProvider is inside AuthProvider or we fetch user manually.
  // To be safe, we'll get the user session inside the function.

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const sendMessageToSprinty = async (message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsThinking(true);
      setExpression('perplexed'); // Use perplexed as "thinking" face

      // 1. Save user message immediately (optimistic UI handled by caller usually, but good to ensure DB sync)
      const { error: msgError } = await supabase
        .from('individual_chat_messages')
        .insert({
          sender_id: user.id,
          receiver_id: '00000000-0000-0000-0000-000000000000', // Sprinty ID
          message: message
        });

      if (msgError) throw msgError;

      // 2. Call the AI Edge Function
      const { error: fnError } = await supabase.functions.invoke('sprinty-brain', {
        body: { user_id: user.id, message }
      });

      if (fnError) throw fnError;

    } catch (error) {
      console.error("Error talking to Sprinty:", error);
      setExpression('frustrated'); // Show error face
      // Optionally insert an error message from system?
    } finally {
      setIsThinking(false);
      setExpression('neutral'); // Reset face
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
      sendMessageToSprinty
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
