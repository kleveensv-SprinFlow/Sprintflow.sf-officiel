import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Config Supabase depuis .env
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquants dans .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Clé API Google / Gemini (pour embeddings)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY (ou GOOGLE_API_KEY) manquant dans .env');
}

const EMBEDDING_MODEL = 'models/text-embedding-004';

async function embedText(text: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
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

async function main() {
  const corpusPath = path.resolve(__dirname, '../src/data/corpus.md');

  if (!fs.existsSync(corpusPath)) {
    throw new Error(`Fichier corpus introuvable: ${corpusPath}`);
  }

  console.log(`📚 Lecture du corpus depuis: ${corpusPath}`);
  const corpus = fs.readFileSync(corpusPath, 'utf-8').trim();

  if (!corpus) {
    throw new Error('Le corpus est vide. Remplis src/data/corpus.md avant de lancer ce script.');
  }

  console.log('🧠 Génération des embeddings...');
  const embedding = await embedText(corpus);

  console.log('💾 Insertion dans la table corpus_embeddings...');
  const { data, error } = await supabase.from('corpus_embeddings').insert({
    content: corpus,
    embedding,
  });

  if (error) {
    console.error('Erreur lors de linsertion dans corpus_embeddings:', error);
    process.exit(1);
  }

  console.log('✅ Corpus inséré avec succès dans corpus_embeddings:', data);
}

main().catch((err) => {
  console.error('Erreur dans scripts/ingest-corpus.ts:', err);
  process.exit(1);
});