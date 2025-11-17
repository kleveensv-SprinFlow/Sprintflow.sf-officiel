// src/scripts/ingest.ts
import { ingestCorpus } from '../lib/rag';

/**
 * Main function to run the ingestion process.
 */
async function main() {
  console.log('Starting corpus ingestion...');
  try {
    await ingestCorpus();
    console.log('Ingestion process completed successfully.');
  } catch (error) {
    console.error('Ingestion process failed:', error);
    process.exit(1);
  }
}

main();
