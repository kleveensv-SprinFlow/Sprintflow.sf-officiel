import { supabase } from './supabase';

export type SprintyMode = 'simplified' | 'expert';
export type Language = 'fr' | 'en' | 'es';

export interface SprintyResponse {
  text: string;
  error?: boolean;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Fonction principale pour obtenir une réponse de Sprinty via Mistral AI
 */
export async function getSprintyAnswer(
  question: string,
  mode: SprintyMode = 'simplified',
  language: Language = 'fr',
  conversationHistory: ConversationMessage[] = []
): Promise<SprintyResponse> {
  try {
    console.log('[SprintyEngine] Appel à Mistral AI:', { question, mode, language });

    const { data, error } = await supabase.functions.invoke('sprinty-mistral', {
      body: {
        question,
        language,
        mode,
        conversationHistory
      }
    });

    if (error) {
      console.error('[SprintyEngine] Erreur Supabase Function:', error);
      throw error;
    }

    if (!data?.answer) {
      throw new Error('Aucune réponse de Mistral AI');
    }

    console.log('[SprintyEngine] Réponse reçue avec succès');

    return {
      text: data.answer,
      error: false
    };

  } catch (error) {
    console.error('[SprintyEngine] Erreur:', error);
    
    const errorMessages = {
      fr: "Désolé, je rencontre une difficulté technique. Peux-tu reformuler ta question ou réessayer dans quelques instants ?",
      en: "Sorry, I'm experiencing a technical issue. Can you rephrase your question or try again in a moment?",
      es: "Lo siento, tengo un problema técnico. ¿Puedes reformular tu pregunta o intentarlo de nuevo en unos momentos?"
    };

    return {
      text: errorMessages[language] || errorMessages.fr,
      error: true
    };
  }
}