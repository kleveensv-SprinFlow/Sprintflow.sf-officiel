import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { getSprintyAnswer } from '../lib/sprintyEngine';

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

      // 1. On sauvegarde le message utilisateur
      const { error: msgError } = await supabase
        .from('individual_chat_messages')
        .insert({
          sender_id: user.id,
          receiver_id: '00000000-0000-0000-0000-000000000000', // Sprinty ID
          message: message
        });

      if (msgError) throw msgError;

      // 2. On récupère le profil pour connaître le rôle (ou on déduit depuis le client)
      // Ici on fait une requête légère pour être sûr
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = profile?.role || 'athlete';

      // 3. On appelle la fonction unifiée getSprintyAnswer
      // Note: getSprintyAnswer appelle 'sprinty-mistal'
      const response = await getSprintyAnswer(
        message,
        user.id,
        userRole,
        'fr', // Langue par défaut ou à récupérer du contexte si dispo
        [] // Historique géré côté serveur ou à passer si besoin
      );

      if (response.error) throw new Error(response.text);

      // 4. On sauvegarde la réponse de l'IA (normalement fait par sprinty-mistal si on le configure,
      // mais getSprintyAnswer renvoie juste le texte. sprinty-mistal ne sauvegarde pas forcément
      // dans 'individual_chat_messages' si on ne lui dit pas de le faire.
      // Vérifions la logique : sprinty-brain le faisait. sprinty-mistal ne le faisait pas.
      // Nous allons donc le faire ici pour être sûr.

      const { error: replyError } = await supabase
        .from('individual_chat_messages')
        .insert({
          sender_id: '00000000-0000-0000-0000-000000000000',
          receiver_id: user.id,
          message: response.text
        });

      if (replyError) throw replyError;

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
