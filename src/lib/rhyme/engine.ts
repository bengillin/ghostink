/**
 * GhostInk Rhyme Engine
 *
 * The core rhyme-finding logic. Takes a word and finds matches
 * across different rhyme types.
 */

import {
  stripStress,
  getRhymePortion,
  getEndingConsonants,
  getVowels,
  isVowel,
  phonemeSimilarity,
  type Phoneme,
  type PhoneticWord,
} from './phonetics';
import { dictionary, PhoneticDictionary } from './dictionary';
import type { RhymeType, RhymeMatch, RhymeQuery, RhymeResult } from './types';

// Active dictionary (can be swapped to full CMU dictionary)
let activeDictionary: PhoneticDictionary = dictionary;

/**
 * Set the active dictionary (e.g., to use full CMU dictionary)
 */
export function setActiveDictionary(dict: PhoneticDictionary): void {
  activeDictionary = dict;
}

/**
 * Get the currently active dictionary
 */
export function getActiveDictionary(): PhoneticDictionary {
  return activeDictionary;
}

/**
 * Check if two words are a perfect rhyme
 * (identical sounds from last stressed vowel to end)
 */
function isPerfectRhyme(a: PhoneticWord, b: PhoneticWord): boolean {
  if (a.word === b.word) return false; // Same word isn't a rhyme

  const aRhyme = getRhymePortion(a.phonemes).map(stripStress);
  const bRhyme = getRhymePortion(b.phonemes).map(stripStress);

  if (aRhyme.length !== bRhyme.length) return false;

  return aRhyme.every((p, i) => p === bRhyme[i]);
}

/**
 * Calculate slant rhyme score (0-1)
 * Near-rhymes that share some but not all ending sounds
 */
function slantRhymeScore(a: PhoneticWord, b: PhoneticWord): number {
  if (a.word === b.word) return 0;

  const aRhyme = getRhymePortion(a.phonemes);
  const bRhyme = getRhymePortion(b.phonemes);

  // If it's a perfect rhyme, not a slant
  const aStripped = aRhyme.map(stripStress);
  const bStripped = bRhyme.map(stripStress);
  if (aStripped.length === bStripped.length &&
      aStripped.every((p, i) => p === bStripped[i])) {
    return 0;
  }

  // Calculate similarity
  return phonemeSimilarity(aRhyme, bRhyme);
}

/**
 * Calculate assonance score (matching vowel sounds)
 */
function assonanceScore(a: PhoneticWord, b: PhoneticWord): number {
  if (a.word === b.word) return 0;

  const aVowels = getVowels(a.phonemes);
  const bVowels = getVowels(b.phonemes);

  if (aVowels.length === 0 || bVowels.length === 0) return 0;

  // Check if ending vowels match
  const aEnd = aVowels[aVowels.length - 1];
  const bEnd = bVowels[bVowels.length - 1];

  if (aEnd !== bEnd) return 0;

  // Score based on how many vowels match from the end
  let matches = 0;
  const minLen = Math.min(aVowels.length, bVowels.length);

  for (let i = 0; i < minLen; i++) {
    if (aVowels[aVowels.length - 1 - i] === bVowels[bVowels.length - 1 - i]) {
      matches++;
    } else {
      break;
    }
  }

  return matches / Math.max(aVowels.length, bVowels.length);
}

/**
 * Calculate consonance score (matching consonant sounds)
 */
function consonanceScore(a: PhoneticWord, b: PhoneticWord): number {
  if (a.word === b.word) return 0;

  const aCons = getEndingConsonants(a.phonemes);
  const bCons = getEndingConsonants(b.phonemes);

  if (aCons.length === 0 || bCons.length === 0) return 0;

  // Check if ending consonants match
  const minLen = Math.min(aCons.length, bCons.length);
  let matches = 0;

  for (let i = 0; i < minLen; i++) {
    if (aCons[aCons.length - 1 - i] === bCons[bCons.length - 1 - i]) {
      matches++;
    } else {
      break;
    }
  }

  return matches / Math.max(aCons.length, bCons.length);
}

/**
 * Check for multisyllabic rhyme (2+ syllables rhyming)
 */
function multisyllabicScore(a: PhoneticWord, b: PhoneticWord): number {
  if (a.word === b.word) return 0;
  if (a.syllableCount < 2 || b.syllableCount < 2) return 0;

  const aRhyme = getRhymePortion(a.phonemes);
  const bRhyme = getRhymePortion(b.phonemes);

  // Count matching syllables from end
  const aVowelCount = aRhyme.filter(isVowel).length;
  const bVowelCount = bRhyme.filter(isVowel).length;

  if (aVowelCount < 2 || bVowelCount < 2) return 0;

  // Simple comparison: how similar are the rhyme portions
  const similarity = phonemeSimilarity(aRhyme, bRhyme);

  // Boost score for longer matches
  const lengthBonus = Math.min(aVowelCount, bVowelCount) / 4;

  return Math.min(similarity + lengthBonus, 1);
}

/**
 * Check if words are identity rhymes (same word or homophone)
 */
function isIdentityRhyme(a: PhoneticWord, b: PhoneticWord): boolean {
  if (a.word === b.word) return true;

  // Check for homophones (different spelling, same sound)
  if (a.phonemes.length !== b.phonemes.length) return false;

  return a.phonemes.every((p: Phoneme, i: number) => stripStress(p) === stripStress(b.phonemes[i]));
}

/**
 * Main rhyme finding function
 */
export function findRhymes(query: RhymeQuery): RhymeResult {
  const {
    word,
    types = ['perfect', 'slant', 'assonance', 'consonance', 'multisyllabic'],
    syllableMatch = false,
    minScore = 0.5,
    limit = 10,
  } = query;

  const result: RhymeResult = {
    query: word,
    matches: {},
  };

  const queryWord = activeDictionary.lookup(word);
  if (!queryWord) {
    // Word not in dictionary - could add phonetic guessing here
    return result;
  }

  const allWords = activeDictionary.getAllWords();
  const candidates: Map<RhymeType, RhymeMatch[]> = new Map();

  // Initialize arrays for each type
  for (const type of types) {
    candidates.set(type, []);
  }

  // Score each word in dictionary
  for (const candidate of allWords) {
    // Skip if syllable match required and doesn't match
    if (syllableMatch && candidate.syllableCount !== queryWord.syllableCount) {
      continue;
    }

    // Check each rhyme type
    if (types.includes('identity') && isIdentityRhyme(queryWord, candidate)) {
      if (queryWord.word !== candidate.word) { // Don't include exact same word
        candidates.get('identity')!.push({
          word: candidate.word,
          type: 'identity',
          score: 1,
          phonemes: candidate.phonemes,
          syllables: candidate.syllableCount,
        });
      }
    }

    if (types.includes('perfect') && isPerfectRhyme(queryWord, candidate)) {
      candidates.get('perfect')!.push({
        word: candidate.word,
        type: 'perfect',
        score: 1,
        phonemes: candidate.phonemes,
        syllables: candidate.syllableCount,
      });
    }

    if (types.includes('slant')) {
      const score = slantRhymeScore(queryWord, candidate);
      if (score >= minScore) {
        candidates.get('slant')!.push({
          word: candidate.word,
          type: 'slant',
          score,
          phonemes: candidate.phonemes,
          syllables: candidate.syllableCount,
        });
      }
    }

    if (types.includes('assonance')) {
      const score = assonanceScore(queryWord, candidate);
      if (score >= minScore) {
        candidates.get('assonance')!.push({
          word: candidate.word,
          type: 'assonance',
          score,
          phonemes: candidate.phonemes,
          syllables: candidate.syllableCount,
        });
      }
    }

    if (types.includes('consonance')) {
      const score = consonanceScore(queryWord, candidate);
      if (score >= minScore) {
        candidates.get('consonance')!.push({
          word: candidate.word,
          type: 'consonance',
          score,
          phonemes: candidate.phonemes,
          syllables: candidate.syllableCount,
        });
      }
    }

    if (types.includes('multisyllabic')) {
      const score = multisyllabicScore(queryWord, candidate);
      if (score >= minScore) {
        candidates.get('multisyllabic')!.push({
          word: candidate.word,
          type: 'multisyllabic',
          score,
          phonemes: candidate.phonemes,
          syllables: candidate.syllableCount,
        });
      }
    }
  }

  // Sort by score and limit
  for (const [type, matches] of candidates) {
    if (matches.length > 0) {
      result.matches[type] = matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }
  }

  return result;
}

/**
 * Quick lookup: just get perfect rhymes
 */
export function getPerfectRhymes(word: string, limit = 10): string[] {
  const result = findRhymes({
    word,
    types: ['perfect'],
    limit,
  });

  return result.matches.perfect?.map((m) => m.word) || [];
}

/**
 * Get all rhymes of any type, sorted by score
 */
export function getAllRhymes(word: string, limit = 20): RhymeMatch[] {
  const result = findRhymes({
    word,
    types: ['perfect', 'slant', 'assonance', 'consonance', 'multisyllabic'],
    minScore: 0.4,
    limit: limit * 2, // Get more candidates per type
  });

  // Flatten and sort all matches
  const all: RhymeMatch[] = [];
  for (const matches of Object.values(result.matches)) {
    if (matches) {
      all.push(...matches);
    }
  }

  // Remove duplicates (word can appear in multiple types)
  const seen = new Set<string>();
  const unique = all.filter((m) => {
    if (seen.has(m.word)) return false;
    seen.add(m.word);
    return true;
  });

  // Sort by score, with type priority (perfect > multi > slant > assonance > consonance)
  const typePriority: Record<RhymeType, number> = {
    perfect: 5,
    multisyllabic: 4,
    slant: 3,
    assonance: 2,
    consonance: 1,
    identity: 0,
    internal: 0,
    mosaic: 0,
  };

  return unique
    .sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      return typePriority[b.type] - typePriority[a.type];
    })
    .slice(0, limit);
}

/**
 * Suggest rhymes for the last word of a line
 */
export function suggestLineEndings(line: string, limit = 5): RhymeMatch[] {
  const words = line.trim().split(/\s+/);
  if (words.length === 0) return [];

  const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z]/g, '');
  if (!lastWord) return [];

  return getAllRhymes(lastWord, limit);
}

/**
 * Analyze rhyme scheme of multiple lines
 */
export function analyzeRhymeScheme(lines: string[]): string[] {
  const scheme: string[] = [];
  const rhymeGroups: Map<string, string> = new Map(); // phonetic suffix -> letter
  let nextLetter = 'A';

  for (const line of lines) {
    const words = line.trim().split(/\s+/);
    if (words.length === 0) {
      scheme.push('-');
      continue;
    }

    const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z]/g, '');
    const wordData = activeDictionary.lookup(lastWord);

    if (!wordData) {
      scheme.push('?');
      continue;
    }

    // Get rhyme portion as key
    const rhymePortion = getRhymePortion(wordData.phonemes)
      .map(stripStress)
      .join('-');

    if (rhymeGroups.has(rhymePortion)) {
      scheme.push(rhymeGroups.get(rhymePortion)!);
    } else {
      rhymeGroups.set(rhymePortion, nextLetter);
      scheme.push(nextLetter);
      nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
    }
  }

  return scheme;
}

// Export the engine
export const rhymeEngine = {
  findRhymes,
  getPerfectRhymes,
  getAllRhymes,
  suggestLineEndings,
  analyzeRhymeScheme,
  getActiveDictionary,
  setActiveDictionary,
};
