/**
 * GhostInk Rhyme Types
 *
 * Definitions for different types of rhymes used in lyric writing.
 */

export type RhymeType =
  | 'perfect'      // Identical rhyming portion (cat/hat)
  | 'slant'        // Near rhyme, similar but not identical (cat/bed)
  | 'assonance'    // Matching vowel sounds (cat/mad)
  | 'consonance'   // Matching consonant sounds (cat/kit)
  | 'multisyllabic'// Multiple syllables rhyme (deliver/shiver)
  | 'internal'     // Rhyme within a line
  | 'identity'     // Same word or homophone
  | 'mosaic';      // Multiple words rhyme with one (understand/butter hand)

export interface RhymeMatch {
  word: string;
  type: RhymeType;
  score: number;      // 0-1, how strong the match
  phonemes: string[];
  syllables: number;
}

export interface RhymeQuery {
  word: string;
  types?: RhymeType[];       // Which types to search for
  syllableMatch?: boolean;   // Match syllable count
  minScore?: number;         // Minimum match score (0-1)
  limit?: number;            // Max results per type
}

export interface RhymeResult {
  query: string;
  matches: {
    [K in RhymeType]?: RhymeMatch[];
  };
}

// Rhyme scheme notation (A, B, C, etc.)
export type RhymeScheme = string[];

// Common rhyme schemes
export const RHYME_SCHEMES = {
  couplet: ['A', 'A'],
  alternate: ['A', 'B', 'A', 'B'],
  enclosed: ['A', 'B', 'B', 'A'],
  monorhyme: ['A', 'A', 'A', 'A'],
  limerick: ['A', 'A', 'B', 'B', 'A'],
  terza_rima: ['A', 'B', 'A', 'B', 'C', 'B', 'C', 'D', 'C'],
  // Common in rap
  chain: ['A', 'A', 'A', 'A', 'B', 'B', 'B', 'B'],
  loose: ['A', 'B', 'C', 'B'],  // Only 2nd and 4th rhyme
} as const;
