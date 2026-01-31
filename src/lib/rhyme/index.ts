/**
 * GhostInk Rhyme Module
 *
 * Public API for rhyme finding and analysis.
 */

export * from './types';
export * from './phonetics';
export { dictionary, PhoneticDictionary } from './dictionary';
export {
  findRhymes,
  getPerfectRhymes,
  getAllRhymes,
  suggestLineEndings,
  analyzeRhymeScheme,
  rhymeEngine,
  setActiveDictionary,
  getActiveDictionary,
} from './engine';

// Server-only exports (use dynamic import or separate entry point)
// export * from './cmu-loader'; // Can't be used client-side (uses 'fs')
