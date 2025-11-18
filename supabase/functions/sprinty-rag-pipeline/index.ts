/* global Deno */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { corsHeaders } from '../_shared/cors.ts';

const EMBEDDING_MODEL = 'models/text-embedding-004';
const GENERATION_MODEL = 'models/gemini-1.5-flash';

const SYSTEM_PROMPTS: Record<string, string> = {
  simplified:
    "Tu es Sprinty, un assistant sportif qui explique les concepts de manière simple, concrète et motivante pour un athlète. Tu fais référence aux concepts de physiologie, d'entraînement et de nutrition issus du corpus fourni, sans jargon inutile.",
  expert:
    "Tu es Sprinty Coach, un expert en physiologie de l'effort, entraînement et nutrition de haut niveau, spécialisé en athlétisme (sprint, demi-fond, fond). Tu donnes des explications détaillées, structurées, avec un vocabulaire technique maîtrisé, tout en restant clair pour un athlète sérieux.",
};

interface RagPayload {
  question?: string;
  expertiseMode?: 'simplified' | 'expert';
  matchCount?: number;
}

async function embedText(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        content: {
          parts: [{ text }],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API error: ${response.status} - ${errorText}`);
  }

  const payload = await response.json();
  const values = payload?.embedding?.values;

  if (!values || !Array.isArray(values)) {
    throw new Error('Embedding API returned an unexpected payload.');
  }

  return values;
}

async function generateAnswer(
  apiKey: string,
  systemPrompt: string,
  question: string,
  context: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: [
                  systemPrompt,
                  '',
                  'Voici un extrait de corpus de connaissances (physiologie, entraînement, nutrition) :',
                  '"""',
                  context,
                  '"""',
                  '',
                  'Question de lacthète :',
                  question,
                  '',
                  "Réponds de manière précise, en français, sans inventer d'informations qui ne seraient pas supportées par le corpus ou par des connaissances de base en physiologie/nutrition d'athlète.",
                ].join('\n'),
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Generation API error: ${response.status} - ${errorText}`);
  }

  const payload = await response.json();
  const text =
    payload?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "Je n'arrive pas à formuler une réponse fiable pour le moment.";

  return text;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!apiKey || !supabaseUrl || !serviceRoleKey) {
      throw new Error('Variables denvironnement manquantes (GEMINI_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    const payload = (await req.json()) as RagPayload;
    const question = (payload.question || '').trim();
    const expertiseMode = payload.expertiseMode || 'simplified';
    const matchCount = payload.matchCount ?? 3;

    if (!question) {
      return new Response(
        JSON.stringify({
          error: 'NO_QUESTION',
          message: 'Aucune question fournie au moteur RAG.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[expertiseMode] ?? SYSTEM_PROMPTS.simplified;

    // 1) Embedding de la question
    const queryEmbedding = await embedText(question, apiKey);

    // 2) Recherche vectorielle via la fonction match_corpus_embeddings
    const { data: matches, error: matchError } = await supabaseClient.rpc(
      'match_corpus_embeddings',
      {
        query_embedding: queryEmbedding,
        match_count: matchCount,
      }
    );

    if (matchError) {
      console.error('Erreur RPC match_corpus_embeddings:', matchError);
      throw matchError;
    }

    const context =
      matches && Array.isArray(matches)
        ? matches
            .map(
              (m: { content: string; similarity: number }) =>
                `# Similarité: ${m.similarity.toFixed(3)}\n${m.content}`
            )
            .join('\n\n---\n\n')
        : '';

    // 3) Génération de la réponse
    const answer = await generateAnswer(apiKey, systemPrompt, question, context);

    return new Response(JSON.stringify({ reply: answer }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error('Erreur dans sprinty-rag-pipeline:', err);
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        message:
          "Je rencontre une difficulté technique pour analyser le corpus pour le moment. Réessaie dans quelques instants.",
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});