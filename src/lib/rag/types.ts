/**
 * GhostInk RAG Types
 *
 * Types for lyric storage, embeddings, and retrieval.
 */

// A single lyric document (verse, song, or snippet)
export interface LyricDocument {
  id: string;
  artistId: string;          // e.g., "doom"
  alias?: string;            // e.g., "viktor-vaughn", "king-geedorah"
  album?: string;
  song: string;
  content: string;           // The actual lyrics
  type: 'verse' | 'hook' | 'full' | 'snippet';
  metadata?: {
    year?: number;
    producer?: string;
    features?: string[];
    themes?: string[];        // e.g., ["villainy", "food", "comics"]
  };
}

// Embedded document with vector
export interface EmbeddedDocument extends LyricDocument {
  embedding: number[];
  tokens?: string[];          // Tokenized content for keyword matching
}

// Query for retrieval
export interface RetrievalQuery {
  text: string;               // Query text
  artistId?: string;          // Filter by artist
  alias?: string;             // Filter by alias
  album?: string;             // Filter by album
  themes?: string[];          // Filter by themes
  topK?: number;              // Number of results (default 5)
  minScore?: number;          // Minimum similarity score (0-1)
}

// Retrieval result
export interface RetrievalResult {
  document: LyricDocument;
  score: number;              // Similarity score (0-1)
  matchedTokens?: string[];   // Which tokens matched
}

// RAG context for Mask generation
export interface RAGContext {
  query: string;
  results: RetrievalResult[];
  summary?: string;           // Optional summary of retrieved context
}
