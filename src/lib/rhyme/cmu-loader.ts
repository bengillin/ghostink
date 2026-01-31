/**
 * CMU Pronouncing Dictionary Loader
 *
 * Loads the full CMU dictionary (~135k words) for comprehensive rhyme matching.
 * The dictionary is loaded lazily on first use.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PhoneticDictionary } from './dictionary';

let fullDictionary: PhoneticDictionary | null = null;
let isLoading = false;
let loadPromise: Promise<PhoneticDictionary> | null = null;

/**
 * Parse a line from the CMU dictionary file
 * Format: "WORD P H O N E M E S" or "WORD(1) P H O N E M E S" for alternates
 */
function parseLine(line: string): { word: string; phonemes: string[] } | null {
  // Skip comments and empty lines
  if (!line || line.startsWith(';;;') || line.startsWith('#') || line.startsWith("'")) {
    return null;
  }

  // Split on whitespace - first part is word, rest are phonemes
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) return null;

  let word = parts[0].toLowerCase();
  const phonemes = parts.slice(1);

  // Remove variant markers like (1), (2), etc.
  word = word.replace(/\(\d+\)$/, '');

  // Skip entries with numbers or special chars in the word (keep hyphens and apostrophes)
  if (!/^[a-z'-]+$/.test(word)) {
    return null;
  }

  // Skip if no valid phonemes
  if (phonemes.length === 0) return null;

  return { word, phonemes };
}

/**
 * Load the CMU dictionary from the data file
 */
export function loadCMUDictionary(): PhoneticDictionary {
  if (fullDictionary) {
    return fullDictionary;
  }

  const dict = new PhoneticDictionary({});

  // Try multiple possible paths
  const possiblePaths = [
    join(process.cwd(), 'src/data/cmudict.txt'),
    join(process.cwd(), 'data/cmudict.txt'),
    join(__dirname, '../../../data/cmudict.txt'),
  ];

  let dictPath: string | null = null;
  for (const p of possiblePaths) {
    if (existsSync(p)) {
      dictPath = p;
      break;
    }
  }

  if (!dictPath) {
    console.warn('CMU dictionary not found, using starter dictionary');
    return dict;
  }

  try {
    const content = readFileSync(dictPath, 'utf-8');
    const lines = content.split('\n');

    let loaded = 0;
    for (const line of lines) {
      const parsed = parseLine(line);
      if (parsed) {
        dict.addWord(parsed.word, parsed.phonemes);
        loaded++;
      }
    }

    console.log(`Loaded ${loaded} words from CMU dictionary`);
    fullDictionary = dict;
    return dict;
  } catch (err) {
    console.error('Failed to load CMU dictionary:', err);
    return dict;
  }
}

/**
 * Load CMU dictionary asynchronously (for client-side or non-blocking load)
 */
export async function loadCMUDictionaryAsync(): Promise<PhoneticDictionary> {
  if (fullDictionary) {
    return fullDictionary;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve) => {
    // Use setTimeout to make it non-blocking
    setTimeout(() => {
      resolve(loadCMUDictionary());
    }, 0);
  });

  return loadPromise;
}

/**
 * Check if full dictionary is loaded
 */
export function isFullDictionaryLoaded(): boolean {
  return fullDictionary !== null;
}

/**
 * Get the full dictionary (loads if needed)
 */
export function getFullDictionary(): PhoneticDictionary {
  if (!fullDictionary) {
    return loadCMUDictionary();
  }
  return fullDictionary;
}
