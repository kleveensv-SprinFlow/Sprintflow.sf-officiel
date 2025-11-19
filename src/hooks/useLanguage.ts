import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type Language = 'fr' | 'en' | 'es';

const translations = {
  fr: {
    sprinty: {
      welcome: "Bonjour ! Je suis Sprinty, ton assistant personnel d'entraînement.",
      simplified: "Simplifié",
      expert: "Expert",
      askQuestion: "Pose ta question à Sprinty...",
      error: "Désolé, je rencontre une difficulté. Peux-tu reformuler ta question ?",
      typing: "Sprinty réfléchit...",
      newConversation: "Nouvelle conversation",
      conversations: "Conversations",
      language: "Langue",
      mode: "Mode",
      send: "Envoyer"
    }
  },
  en: {
    sprinty: {
      welcome: "Hello! I'm Sprinty, your personal training assistant.",
      simplified: "Simplified",
      expert: "Expert",
      askQuestion: "Ask Sprinty a question...",
      error: "Sorry, I'm having trouble. Can you rephrase your question?",
      typing: "Sprinty is thinking...",
      newConversation: "New conversation",
      conversations: "Conversations",
      language: "Language",
      mode: "Mode",
      send: "Send"
    }
  },
  es: {
    sprinty: {
      welcome: "¡Hola! Soy Sprinty, tu asistente personal de entrenamiento.",
      simplified: "Simplificado",
      expert: "Experto",
      askQuestion: "Pregunta a Sprinty...",
      error: "Lo siento, tengo dificultades. ¿Puedes reformular tu pregunta?",
      typing: "Sprinty está pensando...",
      newConversation: "Nueva conversación",
      conversations: "Conversaciones",
      language: "Idioma",
      mode: "Modo",
      send: "Enviar"
    }
  }
};

function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

export const useLanguage = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'fr';
  });

  const [isLoading, setIsLoading] = useState(false);

  // Charger la langue depuis Supabase au montage
  useEffect(() => {
    const loadUserLanguage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('id', user.id)
            .single();

          if (profile?.preferred_language) {
            setLanguageState(profile.preferred_language as Language);
            localStorage.setItem('language', profile.preferred_language);
          }
        }
      } catch (error) {
        console.error('Erreur chargement langue:', error);
      }
    };

    loadUserLanguage();
  }, []);

  const setLanguage = useCallback(async (newLang: Language) => {
    setIsLoading(true);
    try {
      localStorage.setItem('language', newLang);
      setLanguageState(newLang);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_language: newLang })
          .eq('id', user.id);

        if (error) {
          console.error('Erreur sauvegarde langue:', error);
        }
      }
    } catch (error) {
      console.error('Erreur mise à jour langue:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const t = useCallback((key: string): string => {
    return getTranslation(language, key);
  }, [language]);

  return { language, setLanguage, t, isLoading };
};