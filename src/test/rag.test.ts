// src/test/rag.test.ts
/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';
import { execSync } from 'child_process';
import * as path from 'path';

// Increase the timeout as the script execution can take time.
vi.setConfig({ testTimeout: 120000 }); // 2 minutes

describe('SprintFlow RAG System', () => {

  it('should retrieve a relevant passage within the top 5 results', () => {
    // Create a temporary validation script to run in a clean environment.
    const scriptContent = `
      import { ingestCorpus, queryCorpus } from '../lib/rag';
      async function main() {
        await ingestCorpus();
        const results = await queryCorpus('Définis le Seuil Anaérobie', 5);
        console.log(JSON.stringify(results));
      }
      main();
    `;
    const scriptPath = path.resolve('src/scripts/temp-validation.ts');
    require('fs').writeFileSync(scriptPath, scriptContent);
    
    let scriptOutput;
    try {
      scriptOutput = execSync(`npx tsx ${scriptPath}`, { encoding: 'utf-8' });
    } catch (error: any) {
      console.error("Script execution failed:", error.stderr);
      throw new Error("The RAG validation script failed to execute.");
    } finally {
      // Clean up the temporary script
      require('fs').unlinkSync(scriptPath);
    }
    
    const outputLines = scriptOutput.trim().split('\n');
    const jsonOutput = outputLines[outputLines.length - 1];
    const results = JSON.parse(jsonOutput);

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);

    // Check if at least one of the top 5 results is relevant.
    const isRelevantPassageFound = results.some((result: any) =>
      result.text.toLowerCase().includes('seuil anaérobie') &&
      result.text.toLowerCase().includes('lactate')
    );

    expect(isRelevantPassageFound).toBe(true, "The relevant passage about 'seuil anaérobie' was not found in the top 5 results.");
  });
});
