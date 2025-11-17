// src/lib/rag.ts
import { connect, type Connection } from '@lancedb/lancedb';
import { pipeline, type Pipeline } from '@xenova/transformers';
import * as fs from 'fs/promises';
import * as path from 'path';

const DB_PATH = path.resolve('data/sprintflow-db');

// Singleton instances for expensive resources
let embeddingPipeline: Pipeline | null = null;
let dbConnection: Connection | null = null;

async function getEmbeddingPipeline(): Promise<Pipeline> {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  return embeddingPipeline;
}

async function getDbConnection(): Promise<Connection> {
  if (!dbConnection) {
    dbConnection = await connect(DB_PATH);
  }
  return dbConnection;
}

/**
 * Splits the corpus text into semantic chunks based on markdown headers.
 * This more granular strategy splits by any header level (##, ###, etc.).
 * @param text The full text of the corpus.
 * @returns An array of strings, where each string is a semantic chunk.
 */
function chunkText(text: string): string[] {
  // Split by any markdown header (##, ###, ####, etc.)
  // This creates smaller, more semantically focused chunks.
  return text.split(/\n(?=##+ )/).filter((chunk) => chunk.trim() !== '');
}

/**
 * Ingests the knowledge corpus into a local LanceDB vector database.
 * This function is idempotent: it first drops the table if it exists
 * before creating a new one with the fresh data.
 */
export async function ingestCorpus(): Promise<void> {
  try {
    const db = await getDbConnection();

    // Drop the table if it already exists to ensure idempotency
    const tableNames = await db.tableNames();
    if (tableNames.includes('corpus')) {
      await db.dropTable('corpus');
    }

    const corpusPath = path.resolve('src/data/corpus.md');
    const corpusText = await fs.readFile(corpusPath, 'utf-8');
    const chunks = chunkText(corpusText);

    if (chunks.length === 0) {
      console.warn('No chunks were generated from the corpus. Ingestion skipped.');
      return;
    }

    const data = chunks.map((chunk, i) => ({ id: i + 1, text: chunk }));

    const embed = await getEmbeddingPipeline();
    for (const record of data) {
      const result = await embed(record.text, { pooling: 'mean', normalize: true });
      (record as any).vector = Array.from(result.data);
    }
    
    await db.createTable('corpus', data);
    console.log(`Corpus ingested successfully into LanceDB with ${chunks.length} chunks.`);
  } catch (error) {
    console.error('Error during corpus ingestion:', error);
    throw error;
  }
}

/**
 * Queries the vector database to find relevant passages from the corpus.
 * @param query The user's query string.
 * @param limit The maximum number of results to return.
 * @returns A promise that resolves to an array of search results.
 */
export async function queryCorpus(query: string, limit = 3): Promise<any[]> {
  try {
    const db = await getDbConnection();
    
    const tableNames = await db.tableNames();
    if (!tableNames.includes('corpus')) {
      console.warn('Corpus table not found. Returning empty results.');
      return [];
    }

    const table = await db.openTable('corpus');
    const embed = await getEmbeddingPipeline();
    const queryEmbeddingResult = await embed(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(queryEmbeddingResult.data);

    // Corrected LanceDB API usage: .vectorSearch() and .toArray()
    const results = await table
      .vectorSearch(queryVector)
      .select(['text', '_distance'])
      .limit(limit)
      .toArray();

    return results;
  } catch (error) {
    console.error('Error during corpus query:', error);
    return []; 
  }
}
