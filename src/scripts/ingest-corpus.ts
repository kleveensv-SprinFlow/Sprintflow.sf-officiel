/* eslint-env node */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const EMBEDDING_MODEL = 'models/text-embedding-004';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('A Gemini API key (GEMINI_API_KEY) is required to generate embeddings.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function chunkText(text: string, chunkSize = 1400, overlap = 200): string[] {
  const cleaned = text.replace(/\r\n/g, '\n').trim();
  if (!cleaned) {
    return [];
  }

  const paragraphs = cleaned.split(/\n{2,}/);
  const chunks: string[] = [];
  let buffer = '';

  for (const paragraph of paragraphs) {
    const candidate = buffer ? `${buffer}\n\n${paragraph.trim()}` : paragraph.trim();
    if (candidate.length > chunkSize && buffer) {
      chunks.push(buffer.trim());
      const tail = paragraph.trim();
      buffer = tail.length > chunkSize ? tail.slice(0, chunkSize) : tail;
    } else if (candidate.length > chunkSize) {
      chunks.push(candidate.slice(0, chunkSize).trim());
      buffer = candidate.slice(Math.max(0, candidate.length - overlap)).trim();
    } else {
      buffer = candidate;
    }
  }

  if (buffer) {
    chunks.push(buffer.trim());
  }

  // Add overlaps to preserve context
  const overlapped: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const previous = chunks[i - 1] || '';
    const prefix = previous ? previous.slice(-overlap) : '';
    overlapped.push(prefix ? `${prefix}\n${chunks[i]}`.trim() : chunks[i]);
  }

  return overlapped.filter(Boolean);
}

async function generateEmbedding(text: string): Promise<number[]> {
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

  const json = (await response.json()) as { embedding?: { values?: number[] } };
  const values = json.embedding?.values;

  if (!values || !Array.isArray(values)) {
    throw new Error('Embedding API returned an unexpected payload.');
  }

  return values;
}

async function ingestCorpus(): Promise<void> {
  const corpusPath = path.resolve('src/data/corpus.md');
  const corpusText = await fs.readFile(corpusPath, 'utf-8');
  const chunks = chunkText(corpusText);

  if (chunks.length === 0) {
    throw new Error('No chunks were generated from the corpus file.');
  }

  console.log(`Preparing to ingest ${chunks.length} knowledge chunks...`);

  const { error: deleteError } = await supabase
    .from('corpus_embeddings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    throw deleteError;
  }

  const batchSize = 10;
  const buffer: { content: string; embedding: number[] }[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`Embedding chunk ${i + 1}/${chunks.length}...`);
    const embedding = await generateEmbedding(chunk);
    buffer.push({ content: chunk, embedding });

    if (buffer.length === batchSize || i === chunks.length - 1) {
      const { error } = await supabase.from('corpus_embeddings').insert(buffer);
      if (error) {
        throw error;
      }
      buffer.length = 0;
    }
  }

  console.log('Corpus ingestion completed successfully.');
}

void ingestCorpus().catch((error) => {
  console.error('Failed to ingest the corpus:', error);
  process.exit(1);
});