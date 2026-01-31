/**
 * Rhyme API
 *
 * GET /api/rhymes?word=xxx - Find rhymes for a word
 */

import { NextRequest, NextResponse } from 'next/server';
import { findRhymes, type RhymeType, setActiveDictionary } from '@/lib/rhyme';
import { loadCMUDictionary, isFullDictionaryLoaded } from '@/lib/rhyme/cmu-loader';

// Load full dictionary on first API call
let dictionaryInitialized = false;

function ensureDictionaryLoaded() {
  if (!dictionaryInitialized && !isFullDictionaryLoaded()) {
    try {
      const fullDict = loadCMUDictionary();
      setActiveDictionary(fullDict);
      dictionaryInitialized = true;
      console.log('Full CMU dictionary loaded for API');
    } catch (e) {
      console.warn('Failed to load full dictionary, using starter dictionary');
    }
  }
}

export async function GET(request: NextRequest) {
  // Ensure full dictionary is loaded
  ensureDictionaryLoaded();

  const searchParams = request.nextUrl.searchParams;
  const word = searchParams.get('word');
  const typesParam = searchParams.get('types');
  const limit = parseInt(searchParams.get('limit') || '15');

  if (!word) {
    return NextResponse.json(
      { error: 'Missing word parameter' },
      { status: 400 }
    );
  }

  const types: RhymeType[] = typesParam
    ? (typesParam.split(',') as RhymeType[])
    : ['perfect', 'slant', 'assonance', 'consonance', 'multisyllabic'];

  const result = findRhymes({
    word: word.toLowerCase().replace(/[^a-z]/g, ''),
    types,
    minScore: 0.4,
    limit,
  });

  return NextResponse.json(result);
}
