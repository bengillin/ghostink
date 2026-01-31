/**
 * GhostInk Syllable Counter
 *
 * Counts syllables using phonetic dictionary with fallback heuristics.
 */

import { getActiveDictionary, countSyllables as countPhonemes } from '../rhyme';

// Cache for syllable counts
const syllableCache = new Map<string, number>();

/**
 * Count syllables in a word using dictionary lookup with fallback
 */
export function countWordSyllables(word: string): number {
  const normalized = word.toLowerCase().replace(/[^a-z'-]/g, '');
  if (!normalized) return 0;

  // Check cache
  if (syllableCache.has(normalized)) {
    return syllableCache.get(normalized)!;
  }

  // Try dictionary lookup
  const dict = getActiveDictionary();
  const entry = dict.lookup(normalized);

  if (entry) {
    syllableCache.set(normalized, entry.syllableCount);
    return entry.syllableCount;
  }

  // Fallback: heuristic counting
  const count = heuristicSyllableCount(normalized);
  syllableCache.set(normalized, count);
  return count;
}

/**
 * Heuristic syllable counting (when word not in dictionary)
 */
function heuristicSyllableCount(word: string): number {
  if (word.length === 0) return 0;
  if (word.length <= 2) return 1;

  let count = 0;
  const vowels = 'aeiouy';
  let prevWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);

    if (isVowel && !prevWasVowel) {
      count++;
    }
    prevWasVowel = isVowel;
  }

  // Handle silent e
  if (word.endsWith('e') && count > 1) {
    count--;
  }

  // Handle -le endings (like "table")
  if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
    count++;
  }

  // Handle -ed endings
  if (word.endsWith('ed') && word.length > 3) {
    const beforeEd = word[word.length - 3];
    if (beforeEd !== 't' && beforeEd !== 'd') {
      // -ed is usually silent unless preceded by t or d
      count = Math.max(1, count);
    }
  }

  return Math.max(1, count);
}

/**
 * Count syllables in a line of text
 */
export function countLineSyllables(line: string): number {
  const words = line.split(/\s+/).filter(w => w.length > 0);
  return words.reduce((sum, word) => sum + countWordSyllables(word), 0);
}

/**
 * Get syllable breakdown for a line
 */
export function getSyllableBreakdown(line: string): { word: string; syllables: number }[] {
  const words = line.split(/\s+/).filter(w => w.length > 0);
  return words.map(word => ({
    word,
    syllables: countWordSyllables(word),
  }));
}

/**
 * Estimate if a line fits in a certain number of beats
 * Assumes roughly 2 syllables per beat at moderate tempo
 */
export function estimateBeatsNeeded(line: string, syllablesPerBeat: number = 2): number {
  const syllables = countLineSyllables(line);
  return Math.ceil(syllables / syllablesPerBeat);
}

/**
 * Check if line has a certain syllable target (with tolerance)
 */
export function matchesSyllableTarget(
  line: string,
  target: number,
  tolerance: number = 1
): boolean {
  const count = countLineSyllables(line);
  return Math.abs(count - target) <= tolerance;
}

/**
 * Split word into syllables (approximate)
 */
export function splitIntoSyllables(word: string): string[] {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.length <= 2) return [word];

  // Simple consonant-vowel splitting
  const syllables: string[] = [];
  let current = '';
  const vowels = 'aeiouy';
  let inVowelGroup = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const isVowel = vowels.includes(char);

    current += char;

    if (inVowelGroup && !isVowel && i < normalized.length - 1) {
      // Consonant after vowel group - might be syllable boundary
      const nextIsVowel = vowels.includes(normalized[i + 1]);
      if (nextIsVowel && current.length > 1) {
        syllables.push(current.slice(0, -1));
        current = char;
      }
    }

    inVowelGroup = isVowel;
  }

  if (current) {
    syllables.push(current);
  }

  return syllables.length > 0 ? syllables : [word];
}
