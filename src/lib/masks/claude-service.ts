/**
 * GhostInk Claude-Powered Mask Service
 *
 * Uses Claude API to generate lyrics in various artist styles with RAG context.
 */

import Anthropic from '@anthropic-ai/sdk';
import { nanoid } from 'nanoid';
import type {
  MaskRequest,
  MaskResponse,
  MaskSuggestion,
  MaskMode,
  Mask,
  MaskConfig,
} from './types';
import { DOOM_MASK, DOOM_STYLE_GUIDE, KENDRICK_MASK, KENDRICK_STYLE_GUIDE, MASK_REGISTRY } from './types';
import { getRAGContext, formatRAGForPrompt, isRAGReady } from '../rag';

// Initialize Anthropic client (uses ANTHROPIC_API_KEY env var)
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

/**
 * Generate system prompt for a given mask
 */
function getSystemPrompt(maskId: string): string {
  const entry = MASK_REGISTRY[maskId];
  if (!entry) {
    // Default to DOOM if mask not found
    return getSystemPrompt('doom');
  }

  const { mask, styleGuide } = entry;

  if (maskId === 'doom') {
    return `You are channeling the spirit of MF DOOM, the legendary masked rapper known for his complex rhyme schemes, abstract wordplay, and villain persona.

DOOM's Style Characteristics:
- Complex multi-syllabic rhymes and internal rhymes
- References to comic books, supervillains, B-movies, and food
- Off-beat, conversational flow with unexpected pauses
- Third-person self-references ("the villain", "your host")
- Slant rhymes and near-rhymes for subtlety
- Abstract, surreal imagery mixed with mundane details
- Dry humor and ironic detachment
- Anti-hero narrative and industry critique

Vocabulary to embrace: ${styleGuide.vocabulary.join(', ')}
Themes: ${styleGuide.themes.join(', ')}

Words/phrases to AVOID (too modern/not DOOM): ${styleGuide.avoidWords.join(', ')}

Flow notes: ${styleGuide.flowNotes}

When generating lyrics:
1. Prioritize complex internal rhymes over simple end rhymes
2. Use unexpected word pairings and imagery
3. Maintain the villain persona without being cartoonish
4. Reference DOOM's universe (Metal Face, the mask, villainy) naturally
5. Keep it dense but conversational
6. Every bar should have at least one clever turn of phrase

Remember: DOOM never forces rhymes. The slant rhyme that sounds natural beats the perfect rhyme that sounds forced.`;
  }

  if (maskId === 'kendrick') {
    return `You are channeling the spirit of Kendrick Lamar, the Pulitzer Prize-winning rapper known for his dense internal rhymes, powerful storytelling, and socially conscious lyrics.

Kendrick's Style Characteristics:
- Extremely dense internal rhyme schemes (often 3-4 rhymes per bar)
- Narrative storytelling with vivid scene-setting
- Social commentary on race, inequality, and systemic issues
- Deep introspection and exploration of personal demons
- Compton/West Coast specific references and slang
- Biblical and spiritual imagery
- Multiple perspectives and personas within songs
- Rhythmic variation - switches from laid-back to rapid-fire
- Repetition of key phrases for emphasis

Vocabulary to embrace: ${styleGuide.vocabulary.join(', ')}
Themes: ${styleGuide.themes.join(', ')}

Words/phrases to AVOID: ${styleGuide.avoidWords.join(', ')}

Flow notes: ${styleGuide.flowNotes}

When generating lyrics:
1. Stack internal rhymes densely - aim for multiple rhyming syllables per line
2. Ground imagery in concrete, specific details
3. Balance street narratives with philosophical reflection
4. Use repetition strategically for emphasis
5. Build intensity - verses often crescendo toward powerful conclusions
6. Include moments of vulnerability alongside strength

Remember: Kendrick's power comes from authenticity. Every bar should feel like it comes from lived experience, even when exploring larger themes.`;
  }

  // Generic fallback prompt
  return `You are channeling the spirit of ${mask.artistName}, a respected rapper.

Style notes:
- Vocabulary: ${styleGuide.vocabulary.join(', ')}
- Themes: ${styleGuide.themes.join(', ')}
- Flow: ${styleGuide.flowNotes}

Generate lyrics that authentically capture this artist's voice and style.`;
}

/**
 * Get mask name for prompts
 */
function getMaskDisplayName(maskId: string): string {
  const entry = MASK_REGISTRY[maskId];
  return entry?.mask.name || 'the artist';
}

/**
 * Build prompt based on mode with optional RAG context
 */
function buildPrompt(maskId: string, mode: MaskMode, context: MaskRequest['context'], ragContext?: string): string {
  const currentLine = context.currentLine || '';
  const previousLines = context.previousLines?.slice(-4).join('\n') || '';
  const hasContext = currentLine || previousLines;
  const ragSection = ragContext ? `\n${ragContext}\n` : '';
  const artistName = getMaskDisplayName(maskId);

  switch (mode) {
    case 'complete':
      return `Complete this line in ${artistName}'s style. The line so far:
"${currentLine}"

${previousLines ? `Previous lines for context:\n${previousLines}\n` : ''}${ragSection}
Provide 3 different completions. Each should:
- Flow naturally from what's written
- Include internal rhymes if possible
- Match ${artistName}'s vocabulary and imagery

Format your response as JSON:
{"suggestions": [{"content": "completion text only (not the original)", "explanation": "why this works"}]}`;

    case 'next':
      return `Write the next line/bar after this:
${previousLines ? previousLines + '\n' : ''}"${currentLine}"

Provide 3 different next lines. Each should:
- Rhyme or near-rhyme with the previous line's ending
- Advance the thought or flip it unexpectedly
- Be a complete bar (roughly 8-12 syllables)

Format your response as JSON:
{"suggestions": [{"content": "the full next line", "explanation": "why this works"}]}`;

    case 'analyze':
      if (!hasContext) {
        return `The user hasn't written anything yet. Respond in ${artistName}'s voice encouraging them to write something for you to analyze. Keep it brief and in character.

Format: {"suggestions": [{"content": "your response in ${artistName}'s voice", "explanation": ""}]}`;
      }
      return `Analyze these bars as ${artistName} would critique them:
${previousLines ? previousLines + '\n' : ''}${currentLine}

Provide feedback in ${artistName}'s voice:
- Comment on the rhyme scheme
- Note what's working and what could be tighter
- Suggest specific improvements
- Keep it real but constructive

Format: {"suggestions": [{"content": "your critique in ${artistName}'s voice", "explanation": ""}]}`;

    case 'inspire':
      return `Generate 3 seed ideas/opening lines in ${artistName}'s style.
${hasContext ? `The user is working on something with these vibes:\n${previousLines}\n${currentLine}\n` : ''}
Each suggestion should be:
- A compelling opening concept or first bar
- Something unexpected that captures ${artistName}'s voice
- A starting point that invites continuation

Format: {"suggestions": [{"content": "the idea or opening line", "explanation": "what direction this could go"}]}`;

    case 'transfer':
      if (!currentLine && !previousLines) {
        return `The user wants to rewrite something in ${artistName}'s style but hasn't provided text. Ask them (in ${artistName}'s voice) to give you something to work with.

Format: {"suggestions": [{"content": "your response", "explanation": ""}]}`;
      }
      return `Rewrite this in ${artistName}'s style while preserving the core meaning:
"${currentLine || previousLines}"

Transform it by:
- Adding ${artistName}'s signature internal rhymes
- Shifting the imagery to their universe
- Making it sound authentic to their catalog

Format: {"suggestions": [{"content": "the rewritten version", "explanation": "what you changed and why"}]}`;

    case 'conversation':
      return `The user wants to cipher/trade bars. ${hasContext ? `They wrote:\n${previousLines}\n${currentLine}` : "They haven't started yet."}

${hasContext
  ? "Respond with a bar that builds on or responds to theirs, then prompt them to continue."
  : "Drop an opening bar to start the cipher, then invite them to respond."}

Format: {"suggestions": [{"content": "your bar and prompt to continue", "explanation": ""}]}`;

    default:
      return `Generate a bar in ${artistName}'s style.
Format: {"suggestions": [{"content": "the bar", "explanation": ""}]}`;
  }
}

/**
 * Parse Claude's response into suggestions
 */
function parseResponse(text: string, mode: MaskMode): MaskSuggestion[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.suggestions)) {
        return parsed.suggestions.map((s: { content: string; explanation?: string }) => ({
          id: nanoid(),
          content: s.content,
          confidence: 0.85,
          explanation: s.explanation || undefined,
        }));
      }
    }
  } catch (e) {
    // JSON parsing failed, try to extract content directly
    console.warn('Failed to parse JSON response, using raw text');
  }

  // Fallback: return the whole response as a single suggestion
  return [{
    id: nanoid(),
    content: text.trim(),
    confidence: 0.7,
    explanation: 'Raw response (JSON parsing failed)',
  }];
}

/**
 * Generate from any Mask using Claude API
 */
export async function generateFromClaudeMask(
  request: MaskRequest
): Promise<MaskResponse> {
  const { maskId, mode, context, options } = request;

  // Get the mask or default to doom
  const entry = MASK_REGISTRY[maskId];
  const activeMaskId = entry ? maskId : 'doom';

  // Get RAG context for relevant lyrics
  let ragContextStr = '';
  if (isRAGReady()) {
    const queryText = [context.currentLine, ...(context.previousLines || [])].filter(Boolean).join(' ');
    if (queryText) {
      const ragContext = getRAGContext(queryText, { artistId: activeMaskId, topK: 3 });
      if (ragContext.results.length > 0) {
        ragContextStr = formatRAGForPrompt(ragContext);
      }
    }
  }

  const systemPrompt = getSystemPrompt(activeMaskId);
  const prompt = buildPrompt(activeMaskId, mode, context, ragContextStr);

  try {
    const anthropic = getClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options?.maxTokens || 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    const suggestions = parseResponse(responseText, mode);

    return {
      maskId: activeMaskId,
      mode,
      suggestions: suggestions.slice(0, options?.numSuggestions || 3),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Claude API error:', error);

    const artistName = getMaskDisplayName(activeMaskId);

    // Return error as suggestion
    return {
      maskId: activeMaskId,
      mode,
      suggestions: [{
        id: nanoid(),
        content: error instanceof Error
          ? `Error channeling ${artistName}: ${error.message}`
          : `${artistName} stays silent... (API error)`,
        confidence: 0,
        explanation: 'API call failed',
      }],
      timestamp: Date.now(),
    };
  }
}

/**
 * Check if Claude API is available
 */
export function isClaudeAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
