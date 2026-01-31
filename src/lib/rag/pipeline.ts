/**
 * GhostInk RAG Pipeline
 *
 * Retrieval-Augmented Generation for Mask context.
 */

import type { LyricDocument, RAGContext, RetrievalResult } from './types';
import { initializeStore, retrieve, isStoreReady, getDocumentCount } from './store';
import { DOOM_CORPUS_SAMPLE } from './doom-corpus';

// Track initialization
let initialized = false;

/**
 * Initialize RAG pipeline with DOOM corpus
 */
export function initializeRAG(customCorpus?: LyricDocument[]): void {
  const corpus = customCorpus || DOOM_CORPUS_SAMPLE;
  initializeStore(corpus);
  initialized = true;
  console.log(`RAG pipeline initialized with ${corpus.length} documents`);
}

/**
 * Get RAG context for a query
 */
export function getRAGContext(
  query: string,
  options?: {
    artistId?: string;
    alias?: string;
    themes?: string[];
    topK?: number;
  }
): RAGContext {
  // Auto-initialize with sample corpus if not ready
  if (!isStoreReady()) {
    initializeRAG();
  }

  const results = retrieve({
    text: query,
    artistId: options?.artistId || 'doom',
    alias: options?.alias,
    themes: options?.themes,
    topK: options?.topK || 5,
    minScore: 0.05,
  });

  return {
    query,
    results,
    summary: summarizeResults(results),
  };
}

/**
 * Create a summary of retrieved results for the Mask
 */
function summarizeResults(results: RetrievalResult[]): string {
  if (results.length === 0) {
    return 'No relevant lyrics found in corpus.';
  }

  const lines: string[] = [
    `Found ${results.length} relevant passages:`,
  ];

  for (const result of results) {
    const { document: doc, score, matchedTokens } = result;
    const alias = doc.alias ? ` (${doc.alias})` : '';
    const song = doc.song || 'Unknown';

    lines.push(`\n[${song}${alias}] (relevance: ${(score * 100).toFixed(0)}%)`);
    lines.push(doc.content);

    if (matchedTokens && matchedTokens.length > 0) {
      lines.push(`Matched: ${matchedTokens.slice(0, 5).join(', ')}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format RAG context for insertion into Mask prompt
 */
export function formatRAGForPrompt(context: RAGContext): string {
  if (context.results.length === 0) {
    return '';
  }

  const sections: string[] = [
    '=== REFERENCE LYRICS ===',
    'Use these as stylistic inspiration (DO NOT copy directly):',
  ];

  for (const result of context.results) {
    const { document: doc } = result;
    sections.push(`\n[From "${doc.song}"${doc.alias ? ` as ${doc.alias}` : ''}]`);
    sections.push(doc.content);
  }

  sections.push('\n=== END REFERENCES ===');
  sections.push('Use the above as stylistic reference only. Generate original content.');

  return sections.join('\n');
}

/**
 * Check if RAG is ready
 */
export function isRAGReady(): boolean {
  return initialized && isStoreReady();
}

/**
 * Get corpus stats
 */
export function getRAGStats(): { documentCount: number; isReady: boolean } {
  return {
    documentCount: getDocumentCount(),
    isReady: isRAGReady(),
  };
}

/**
 * Add lyrics to the corpus (for user-provided content)
 */
export async function addLyricsToCorpus(lyrics: LyricDocument[]): Promise<void> {
  if (!initialized) {
    initializeRAG(lyrics);
  } else {
    // Re-initialize with combined corpus
    const existing = require('./store').getAllDocuments();
    initializeStore([...existing, ...lyrics]);
  }
}
