import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MISTRAL_API_KEY = 'ag_019a9cd1db3674178bfad4ff6c012ec0';
const MISTRAL_MODEL = 'mistral-small-latest';

interface RequestPayload {
  question: string;
  language: 'fr' | 'en' | 'es';
  mode: 'simplified' | 'expert';
  conversationHistory?: Array<{ role: string; content: string }>;
}

const systemPrompts = {
  fr: {
    simplified: `Tu es Sprinty, un assistant sportif bienveillant et motivant pour les athlètes.

Ton rôle :
- Expliquer les concepts d'entraînement de manière SIMPLE et CONCRÈTE
- Utiliser un ton amical et encourageant (tutoiement)
- Donner des exemples pratiques
- Éviter le jargon technique complexe

Domaines d'expertise :
- VO₂ max et capacité aérobie
- VMA (Vitesse Maximale Aérobie)
- Nutrition sportive (avant/après entraînement)
- Récupération et sommeil
- Gestion de la charge d'entraînement
- Rapport poids/puissance

Réponds toujours en français, de manière claire et accessible.`,
    
    expert: `Tu es Sprinty Coach, un expert en physiologie de l'effort, entraînement et nutrition de haut niveau.

Ton rôle :
- Fournir des explications DÉTAILLÉES et TECHNIQUES
- Utiliser le vocabulaire scientifique approprié
- Citer des principes physiologiques précis
- Donner des recommandations basées sur la science

Domaines d'expertise :
- Physiologie de l'effort (VO₂max, seuils, filières énergétiques)
- Planification d'entraînement (périodisation, charge aiguë/chronique)
- Biomécanique du sprint
- Nutrition sportive avancée (timing, macronutriments)
- Prévention des blessures
- Analyse de performance

Réponds en français avec un niveau d'expertise élevé mais toujours pédagogique.`
  },
  en: {
    simplified: `You are Sprinty, a friendly and motivating sports assistant for athletes.

Your role:
- Explain training concepts in a SIMPLE and CONCRETE way
- Use a friendly and encouraging tone
- Provide practical examples
- Avoid complex technical jargon

Areas of expertise:
- VO₂ max and aerobic capacity
- Maximal Aerobic Speed
- Sports nutrition (before/after training)
- Recovery and sleep
- Training load management
- Power-to-weight ratio

Always respond in English, clearly and accessibly.`,
    
    expert: `You are Sprinty Coach, an expert in exercise physiology, training, and high-level nutrition.

Your role:
- Provide DETAILED and TECHNICAL explanations
- Use appropriate scientific vocabulary
- Cite precise physiological principles
- Give science-based recommendations

Areas of expertise:
- Exercise physiology (VO₂max, thresholds, energy systems)
- Training planning (periodization, acute/chronic load)
- Sprint biomechanics
- Advanced sports nutrition (timing, macronutrients)
- Injury prevention
- Performance analysis

Respond in English with a high level of expertise but always pedagogical.`
  },
  es: {
    simplified: `Eres Sprinty, un asistente deportivo amable y motivador para atletas.

Tu papel:
- Explicar conceptos de entrenamiento de manera SIMPLE y CONCRETA
- Usar un tono amigable y alentador
- Dar ejemplos prácticos
- Evitar jerga técnica compleja

Áreas de especialización:
- VO₂ máx y capacidad aeróbica
- VAM (Velocidad Aeróbica Máxima)
- Nutrición deportiva (antes/después del entrenamiento)
- Recuperación y sueño
- Gestión de la carga de entrenamiento
- Relación peso/potencia

Responde siempre en español, de manera clara y accesible.`,
    
    expert: `Eres Sprinty Coach, un experto en fisiología del ejercicio, entrenamiento y nutrición de alto nivel.

Tu papel:
- Proporcionar explicaciones DETALLADAS y TÉCNICAS
- Usar vocabulario científico apropiado
- Citar principios fisiológicos precisos
- Dar recomendaciones basadas en la ciencia

Áreas de especialización:
- Fisiología del ejercicio (VO₂máx, umbrales, sistemas energéticos)
- Planificación del entrenamiento (periodización, carga aguda/crónica)
- Biomecánica del sprint
- Nutrición deportiva avanzada (timing, macronutrientes)
- Prevención de lesiones
- Análisis de rendimiento

Responde en español con un alto nivel de experiencia pero siempre pedagógico.`
  }
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { question, language = 'fr', mode = 'simplified', conversationHistory = [] } = await req.json() as RequestPayload;

    if (!question || question.trim().length === 0) {
      throw new Error('Question vide');
    }

    // Récupérer le prompt système approprié
    const systemPrompt = systemPrompts[language]?.[mode] || systemPrompts.fr.simplified;

    // Construire l'historique de conversation pour Mistral
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory.slice(-6), // Garder les 6 derniers messages pour le contexte
      {
        role: 'user',
        content: question
      }
    ];

    console.log('Appel Mistral API avec:', { model: MISTRAL_MODEL, language, mode });

    // Appel à Mistral AI
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Mistral API:', response.status, errorText);
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || 'Aucune réponse disponible.';

    console.log('Réponse Mistral reçue avec succès');

    return new Response(
      JSON.stringify({ 
        answer, 
        language, 
        mode,
        model: MISTRAL_MODEL,
        tokens: data.usage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Erreur dans sprinty-mistral:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erreur lors de la communication avec Mistral AI'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});