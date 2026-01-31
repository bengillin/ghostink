/**
 * GhostInk RAG Module
 */

export * from './types';
export { initializeStore, retrieve, isStoreReady, getDocumentCount, addDocument } from './store';
export { tokenize, embed, cosineSimilarity } from './embeddings';
export {
  initializeRAG,
  getRAGContext,
  formatRAGForPrompt,
  isRAGReady,
  getRAGStats,
  addLyricsToCorpus,
} from './pipeline';
export { DOOM_CORPUS_SAMPLE, DOOM_THEMES, DOOM_ALIASES, DOOM_ALBUMS } from './doom-corpus';
