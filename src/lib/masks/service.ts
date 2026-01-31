/**
 * GhostInk Mask Service
 *
 * Handles communication with AI models for Mask functionality.
 * This is a stub - actual implementation will connect to AI APIs.
 */

import { nanoid } from 'nanoid';
import type {
  Mask,
  MaskRequest,
  MaskResponse,
  MaskSuggestion,
  MaskMode,
} from './types';
import { DOOM_MASK, DOOM_STYLE_GUIDE } from './types';
import { getAllRhymes } from '../rhyme';

// Registry of available masks
const masks: Map<string, Mask> = new Map([
  [DOOM_MASK.id, DOOM_MASK],
]);

/**
 * Get all available masks
 */
export function getAvailableMasks(): Mask[] {
  return Array.from(masks.values());
}

/**
 * Get a specific mask
 */
export function getMask(id: string): Mask | undefined {
  return masks.get(id);
}

/**
 * Generate suggestions from a Mask
 *
 * STUB: Returns mock responses. Real implementation will:
 * 1. Build context from request
 * 2. Retrieve relevant lyrics via RAG
 * 3. Send to fine-tuned model
 * 4. Post-process and score responses
 */
export async function generateFromMask(
  request: MaskRequest
): Promise<MaskResponse> {
  const { maskId, mode, context, options } = request;
  const numSuggestions = options?.numSuggestions || 3;

  // Get mask (default to DOOM)
  const mask = masks.get(maskId) || DOOM_MASK;

  // Generate based on mode
  const suggestions = await generateSuggestions(mode, context, numSuggestions);

  return {
    maskId: mask.id,
    mode,
    suggestions,
    timestamp: Date.now(),
  };
}

/**
 * Generate suggestions based on mode
 * STUB implementation with hardcoded DOOM-style examples
 */
async function generateSuggestions(
  mode: MaskMode,
  context: MaskRequest['context'],
  count: number
): Promise<MaskSuggestion[]> {
  const suggestions: MaskSuggestion[] = [];

  // Get rhymes for context if available
  const lastWord = context.currentLine?.split(/\s+/).pop()?.toLowerCase().replace(/[^a-z]/g, '');
  const rhymes = lastWord ? getAllRhymes(lastWord, 5).map(r => r.word) : [];

  switch (mode) {
    case 'complete':
      // Complete the current line
      suggestions.push(
        {
          id: nanoid(),
          content: 'with a fistful of steel, villain reveal',
          confidence: 0.85,
          explanation: 'Internal rhyme with "steel/reveal", DOOM vocabulary',
          rhymesWith: rhymes,
        },
        {
          id: nanoid(),
          content: 'cold and calculating, never hesitating',
          confidence: 0.78,
          explanation: 'Double internal rhyme, flows conversationally',
          rhymesWith: rhymes,
        },
        {
          id: nanoid(),
          content: 'raw like sushi, catch him in the hooptie',
          confidence: 0.72,
          explanation: 'Food reference + slang, unexpected pairing',
          rhymesWith: rhymes,
        }
      );
      break;

    case 'next':
      // Write the next line
      suggestions.push(
        {
          id: nanoid(),
          content: "Wrote this at the wee hours, sipping tea sour",
          confidence: 0.82,
          explanation: 'Multi-syllabic rhyme, domestic imagery',
          rhymesWith: rhymes,
        },
        {
          id: nanoid(),
          content: "The metal face menace, apprentice to the lettuce",
          confidence: 0.88,
          explanation: 'Self-reference + food wordplay',
          rhymesWith: rhymes,
        },
        {
          id: nanoid(),
          content: "Check the résumé, it's comme ci comme ça",
          confidence: 0.75,
          explanation: 'French phrase, casual dismissiveness',
          rhymesWith: rhymes,
        }
      );
      break;

    case 'analyze':
      // Analyze/critique
      suggestions.push({
        id: nanoid(),
        content: context.currentLine
          ? `That line got potential but the internal's weak. Try flipping the syllables - "villain" could hit harder mid-bar. The imagery's there but make it weirder, more specific. Nobody else would say it like that.`
          : 'Need some bars to analyze, chief.',
        confidence: 0.9,
        explanation: 'In-character DOOM critique',
      });
      break;

    case 'inspire':
      // Seed ideas
      suggestions.push(
        {
          id: nanoid(),
          content: 'Theme: A villain monologue at a grocery store',
          confidence: 0.8,
          explanation: 'Mundane setting + villain persona = DOOM',
        },
        {
          id: nanoid(),
          content: 'Theme: The mask speaks for itself',
          confidence: 0.85,
          explanation: 'Meta-commentary on persona',
        },
        {
          id: nanoid(),
          content: 'Opening: "Heard the beat and had to break it down like produce..."',
          confidence: 0.78,
          explanation: 'Food metaphor + musicality',
        }
      );
      break;

    case 'transfer':
      // Rewrite in style
      const original = context.currentLine || 'I am the greatest rapper alive';
      suggestions.push({
        id: nanoid(),
        content: `Hm, "${original}" becomes: "Villain status cemented, the greatest they resented / Every sentence, a percentage of the vengeance"`,
        confidence: 0.82,
        explanation: 'Added internal rhymes, villain framing, multi-syllabic chain',
      });
      break;

    case 'conversation':
      // Back-and-forth
      suggestions.push({
        id: nanoid(),
        content: "Aight, you started strong. Now flip it - what's the villain's response to that? Keep the scheme going but twist the meaning.",
        confidence: 0.85,
        explanation: 'Collaborative prompt for next move',
      });
      break;
  }

  return suggestions.slice(0, count);
}

/**
 * Check if mask is available
 */
export function isMaskAvailable(id: string): boolean {
  const mask = masks.get(id);
  return mask?.status === 'active';
}
