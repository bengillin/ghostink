/**
 * GhostInk Phonetic Engine
 *
 * Handles phonetic representation and comparison for rhyme matching.
 * Uses ARPAbet phoneme system (same as CMU Pronouncing Dictionary).
 */

// ARPAbet vowel phonemes (these carry stress markers 0, 1, 2)
export const VOWELS = new Set([
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY',
  'IH', 'IY', 'OW', 'OY', 'UH', 'UW'
]);

// ARPAbet consonant phonemes
export const CONSONANTS = new Set([
  'B', 'CH', 'D', 'DH', 'F', 'G', 'HH', 'JH', 'K', 'L',
  'M', 'N', 'NG', 'P', 'R', 'S', 'SH', 'T', 'TH', 'V',
  'W', 'Y', 'Z', 'ZH'
]);

// Phoneme type
export type Phoneme = string;

// Word with its phonetic representation
export interface PhoneticWord {
  word: string;
  phonemes: Phoneme[];
  syllableCount: number;
}

/**
 * Strip stress markers from phoneme (AA1 -> AA)
 */
export function stripStress(phoneme: Phoneme): string {
  return phoneme.replace(/[012]$/, '');
}

/**
 * Get stress level from phoneme (0, 1, 2, or -1 for consonants)
 */
export function getStress(phoneme: Phoneme): number {
  const match = phoneme.match(/[012]$/);
  return match ? parseInt(match[0]) : -1;
}

/**
 * Check if phoneme is a vowel
 */
export function isVowel(phoneme: Phoneme): boolean {
  return VOWELS.has(stripStress(phoneme));
}

/**
 * Count syllables from phonemes (each vowel = 1 syllable)
 */
export function countSyllables(phonemes: Phoneme[]): number {
  return phonemes.filter(isVowel).length;
}

/**
 * Get the rhyming portion of phonemes (from last stressed vowel to end)
 */
export function getRhymePortion(phonemes: Phoneme[]): Phoneme[] {
  // Find last stressed vowel (stress 1 or 2)
  let lastStressedIndex = -1;
  for (let i = phonemes.length - 1; i >= 0; i--) {
    const stress = getStress(phonemes[i]);
    if (stress === 1 || stress === 2) {
      lastStressedIndex = i;
      break;
    }
  }

  // If no stressed vowel found, use last vowel
  if (lastStressedIndex === -1) {
    for (let i = phonemes.length - 1; i >= 0; i--) {
      if (isVowel(phonemes[i])) {
        lastStressedIndex = i;
        break;
      }
    }
  }

  // Return from stressed vowel to end
  return lastStressedIndex >= 0 ? phonemes.slice(lastStressedIndex) : phonemes;
}

/**
 * Get ending consonant cluster (for consonance matching)
 */
export function getEndingConsonants(phonemes: Phoneme[]): Phoneme[] {
  const result: Phoneme[] = [];
  for (let i = phonemes.length - 1; i >= 0; i--) {
    if (!isVowel(phonemes[i])) {
      result.unshift(phonemes[i]);
    } else {
      break;
    }
  }
  return result;
}

/**
 * Get all vowels (for assonance matching)
 */
export function getVowels(phonemes: Phoneme[]): Phoneme[] {
  return phonemes.filter(isVowel).map(stripStress);
}

/**
 * Compare two phoneme sequences for similarity (0-1)
 */
export function phonemeSimilarity(a: Phoneme[], b: Phoneme[]): number {
  if (a.length === 0 || b.length === 0) return 0;

  const aStripped = a.map(stripStress);
  const bStripped = b.map(stripStress);

  // Simple matching: count matching phonemes from end
  let matches = 0;
  const minLen = Math.min(aStripped.length, bStripped.length);

  for (let i = 0; i < minLen; i++) {
    if (aStripped[aStripped.length - 1 - i] === bStripped[bStripped.length - 1 - i]) {
      matches++;
    } else {
      break;
    }
  }

  return matches / Math.max(aStripped.length, bStripped.length);
}
