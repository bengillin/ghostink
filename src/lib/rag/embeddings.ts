/**
 * GhostInk Embeddings
 *
 * Simple TF-IDF style embeddings for lyric similarity.
 * No external API required - runs locally.
 */

// Stopwords to filter out
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
  'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
  'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
  'our', 'their', 'what', 'which', 'who', 'whom', 'if', 'then', 'else',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now',
  'im', "i'm", 'aint', "ain't", 'gonna', 'gotta', 'wanna', 'ya', 'yo',
]);

// Vocabulary for the vector space
let vocabulary: Map<string, number> = new Map();
let idfScores: Map<string, number> = new Map();
let documentCount = 0;

/**
 * Tokenize text into words
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOPWORDS.has(word));
}

/**
 * Build vocabulary from a corpus of documents
 */
export function buildVocabulary(documents: string[]): void {
  const documentFrequency: Map<string, number> = new Map();
  documentCount = documents.length;

  // Count document frequency for each term
  for (const doc of documents) {
    const tokens = new Set(tokenize(doc));
    for (const token of tokens) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
  }

  // Build vocabulary (filter rare terms)
  vocabulary.clear();
  idfScores.clear();

  let index = 0;
  for (const [term, df] of documentFrequency) {
    // Include terms that appear in at least 1 doc but not more than 80% of docs
    if (df >= 1 && df < documentCount * 0.8) {
      vocabulary.set(term, index++);
      // Calculate IDF: log(N / df)
      idfScores.set(term, Math.log(documentCount / df));
    }
  }
}

/**
 * Create TF-IDF embedding for text
 */
export function embed(text: string): number[] {
  const tokens = tokenize(text);
  const termFrequency: Map<string, number> = new Map();

  // Count term frequency
  for (const token of tokens) {
    termFrequency.set(token, (termFrequency.get(token) || 0) + 1);
  }

  // Create sparse vector
  const vector = new Array(vocabulary.size).fill(0);

  for (const [term, tf] of termFrequency) {
    const index = vocabulary.get(term);
    if (index !== undefined) {
      const idf = idfScores.get(term) || 1;
      // TF-IDF: tf * idf (with log normalization)
      vector[index] = (1 + Math.log(tf)) * idf;
    }
  }

  // L2 normalize
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
  }

  // Vectors are already normalized, so just return dot product
  return dotProduct;
}

/**
 * Get vocabulary size
 */
export function getVocabularySize(): number {
  return vocabulary.size;
}

/**
 * Check if vocabulary is built
 */
export function isVocabularyReady(): boolean {
  return vocabulary.size > 0;
}

/**
 * Get tokens that appear in vocabulary (for debugging)
 */
export function getMatchingTokens(text: string): string[] {
  return tokenize(text).filter(token => vocabulary.has(token));
}
