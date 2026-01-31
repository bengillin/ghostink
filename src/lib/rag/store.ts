/**
 * GhostInk Vector Store
 *
 * In-memory vector store for lyric documents with similarity search.
 */

import { nanoid } from 'nanoid';
import type {
  LyricDocument,
  EmbeddedDocument,
  RetrievalQuery,
  RetrievalResult,
} from './types';
import {
  buildVocabulary,
  embed,
  cosineSimilarity,
  tokenize,
  isVocabularyReady,
  getVocabularySize,
} from './embeddings';

// In-memory document store
let documents: EmbeddedDocument[] = [];
let isInitialized = false;

/**
 * Initialize the store with documents
 */
export function initializeStore(docs: LyricDocument[]): void {
  // Build vocabulary from all documents
  const contents = docs.map(d => d.content);
  buildVocabulary(contents);

  // Embed all documents
  documents = docs.map(doc => ({
    ...doc,
    embedding: embed(doc.content),
    tokens: tokenize(doc.content),
  }));

  isInitialized = true;
  console.log(`Vector store initialized: ${documents.length} documents, ${getVocabularySize()} vocabulary`);
}

/**
 * Add a single document to the store
 */
export function addDocument(doc: LyricDocument): EmbeddedDocument {
  if (!isVocabularyReady()) {
    // Initialize with just this document
    buildVocabulary([doc.content]);
  }

  const embedded: EmbeddedDocument = {
    ...doc,
    id: doc.id || nanoid(),
    embedding: embed(doc.content),
    tokens: tokenize(doc.content),
  };

  documents.push(embedded);
  return embedded;
}

/**
 * Retrieve similar documents
 */
export function retrieve(query: RetrievalQuery): RetrievalResult[] {
  const {
    text,
    artistId,
    alias,
    album,
    themes,
    topK = 5,
    minScore = 0.1,
  } = query;

  if (!isVocabularyReady() || documents.length === 0) {
    return [];
  }

  // Embed the query
  const queryEmbedding = embed(text);
  const queryTokens = new Set(tokenize(text));

  // Filter and score documents
  const results: RetrievalResult[] = [];

  for (const doc of documents) {
    // Apply filters
    if (artistId && doc.artistId !== artistId) continue;
    if (alias && doc.alias !== alias) continue;
    if (album && doc.album !== album) continue;
    if (themes && themes.length > 0) {
      const docThemes = new Set(doc.metadata?.themes || []);
      if (!themes.some(t => docThemes.has(t))) continue;
    }

    // Calculate similarity
    const score = cosineSimilarity(queryEmbedding, doc.embedding);

    if (score >= minScore) {
      // Find matched tokens
      const matchedTokens = doc.tokens?.filter(t => queryTokens.has(t)) || [];

      results.push({
        document: {
          id: doc.id,
          artistId: doc.artistId,
          alias: doc.alias,
          album: doc.album,
          song: doc.song,
          content: doc.content,
          type: doc.type,
          metadata: doc.metadata,
        },
        score,
        matchedTokens,
      });
    }
  }

  // Sort by score and return top K
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Get all documents (for debugging/export)
 */
export function getAllDocuments(): LyricDocument[] {
  return documents.map(d => ({
    id: d.id,
    artistId: d.artistId,
    alias: d.alias,
    album: d.album,
    song: d.song,
    content: d.content,
    type: d.type,
    metadata: d.metadata,
  }));
}

/**
 * Get document count
 */
export function getDocumentCount(): number {
  return documents.length;
}

/**
 * Check if store is initialized
 */
export function isStoreReady(): boolean {
  return isInitialized && documents.length > 0;
}

/**
 * Clear the store
 */
export function clearStore(): void {
  documents = [];
  isInitialized = false;
}

/**
 * Get documents by artist
 */
export function getDocumentsByArtist(artistId: string): LyricDocument[] {
  return documents
    .filter(d => d.artistId === artistId)
    .map(d => ({
      id: d.id,
      artistId: d.artistId,
      alias: d.alias,
      album: d.album,
      song: d.song,
      content: d.content,
      type: d.type,
      metadata: d.metadata,
    }));
}
