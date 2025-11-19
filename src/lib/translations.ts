export const translations = {
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
    },
    common: {
      vo2max: "VO₂ max",
      vma: "VMA",
      nutrition: "Nutrition",
      recovery: "Récupération",
      training: "Entraînement",
      performance: "Performance"
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
    },
    common: {
      vo2max: "VO₂ max",
      vma: "Maximal Aerobic Speed",
      nutrition: "Nutrition",
      recovery: "Recovery",
      training: "Training",
      performance: "Performance"
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
    },
    common: {
      vo2max: "VO₂ máx",
      vma: "VAM",
      nutrition: "Nutrición",
      recovery: "Recuperación",
      training: "Entrenamiento",
      performance: "Rendimiento"
    }
  }
};

export type Language = 'fr' | 'en' | 'es';

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}