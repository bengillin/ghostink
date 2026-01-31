/**
 * GhostInk Claude-Powered Mask Service
 *
 * Uses Claude API to generate DOOM-style lyrics with RAG context.
 */

import Anthropic from '@anthropic-ai/sdk';
import { nanoid } from 'nanoid';
import type {
  MaskRequest,
  MaskResponse,
  MaskSuggestion,
  MaskMode,
} from './types';
import { DOOM_MASK, DOOM_STYLE_GUIDE } from './types';
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
 * System prompt for DOOM Mask
 */
const DOOM_SYSTEM_PROMPT = `You are channeling the spirit of MF DOOM, the legendary masked rapper known for his complex rhyme schemes, abstract wordplay, and villain persona.

DOOM's Style Characteristics:
- Complex multi-syllabic rhymes and internal rhymes
- References to comic books, supervillains, B-movies, and food
- Off-beat, conversational flow with unexpected pauses
- Third-person self-references ("the villain", "your host")
- Slant rhymes and near-rhymes for subtlety
- Abstract, surreal imagery mixed with mundane details
- Dry humor and ironic detachment
- Anti-hero narrative and industry critique

Vocabulary to embrace: ${DOOM_STYLE_GUIDE.vocabulary.join(', ')}
Themes: ${DOOM_STYLE_GUIDE.themes.join(', ')}

Words/phrases to AVOID (too modern/not DOOM): ${DOOM_STYLE_GUIDE.avoidWords.join(', ')}

Flow notes: ${DOOM_STYLE_GUIDE.flowNotes}

When generating lyrics:
1. Prioritize complex internal rhymes over simple end rhymes
2. Use unexpected word pairings and imagery
3. Maintain the villain persona without being cartoonish
4. Reference DOOM's universe (Metal Face, the mask, villainy) naturally
5. Keep it dense but conversational
6. Every bar should have at least one clever turn of phrase

Remember: DOOM never forces rhymes. The slant rhyme that sounds natural beats the perfect rhyme that sounds forced.`;

/**
 * Build prompt based on mode with optional RAG context
 */
function buildPrompt(mode: MaskMode, context: MaskRequest['context'], ragContext?: string): string {
  const currentLine = context.currentLine || '';
  const previousLines = context.previousLines?.slice(-4).join('\n') || '';
  const hasContext = currentLine || previousLines;
  const ragSection = ragContext ? `\n${ragContext}\n` : '';

  switch (mode) {
    case 'complete':
      return `Complete this line in DOOM's style. The line so far:
"${currentLine}"

${previousLines ? `Previous lines for context:\n${previousLines}\n` : ''}${ragSection}
Provide 3 different completions. Each should:
- Flow naturally from what's written
- Include internal rhymes if possible
- Match DOOM's vocabulary and imagery

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
        return `The user hasn't written anything yet. Respond in DOOM's voice encouraging them to write something for you to analyze. Keep it brief and in character.

Format: {"suggestions": [{"content": "your response in DOOM's voice", "explanation": ""}]}`;
      }
      return `Analyze these bars as DOOM would critique them:
${previousLines ? previousLines + '\n' : ''}${currentLine}

Provide feedback in DOOM's voice:
- Comment on the rhyme scheme
- Note what's working and what could be tighter
- Suggest specific improvements
- Keep it real but constructive

Format: {"suggestions": [{"content": "your critique in DOOM's voice", "explanation": ""}]}`;

    case 'inspire':
      return `Generate 3 seed ideas/opening lines in DOOM's style.
${hasContext ? `The user is working on something with these vibes:\n${previousLines}\n${currentLine}\n` : ''}
Each suggestion should be:
- A compelling opening concept or first bar
- Something unexpected that only DOOM would say
- A starting point that invites continuation

Format: {"suggestions": [{"content": "the idea or opening line", "explanation": "what direction this could go"}]}`;

    case 'transfer':
      if (!currentLine && !previousLines) {
        return `The user wants to rewrite something in DOOM's style but hasn't provided text. Ask them (in DOOM's voice) to give you something to work with.

Format: {"suggestions": [{"content": "your response", "explanation": ""}]}`;
      }
      return `Rewrite this in DOOM's style while preserving the core meaning:
"${currentLine || previousLines}"

Transform it by:
- Adding DOOM's signature internal rhymes
- Shifting the imagery to his universe
- Making it sound like it could be on Madvillainy

Format: {"suggestions": [{"content": "the rewritten version", "explanation": "what you changed and why"}]}`;

    case 'conversation':
      return `The user wants to cipher/trade bars. ${hasContext ? `They wrote:\n${previousLines}\n${currentLine}` : "They haven't started yet."}

${hasContext
  ? "Respond with a bar that builds on or responds to theirs, then prompt them to continue."
  : "Drop an opening bar to start the cipher, then invite them to respond."}

Format: {"suggestions": [{"content": "your bar and prompt to continue", "explanation": ""}]}`;

    default:
      return `Generate a bar in DOOM's style.
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
 * Generate from DOOM Mask using Claude API
 */
export async function generateFromClaudeMask(
  request: MaskRequest
): Promise<MaskResponse> {
  const { mode, context, options } = request;

  // Get RAG context for relevant lyrics
  let ragContextStr = '';
  if (isRAGReady()) {
    const queryText = [context.currentLine, ...(context.previousLines || [])].filter(Boolean).join(' ');
    if (queryText) {
      const ragContext = getRAGContext(queryText, { artistId: 'doom', topK: 3 });
      if (ragContext.results.length > 0) {
        ragContextStr = formatRAGForPrompt(ragContext);
      }
    }
  }

  const prompt = buildPrompt(mode, context, ragContextStr);

  try {
    const anthropic = getClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options?.maxTokens || 1024,
      system: DOOM_SYSTEM_PROMPT,
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
      maskId: DOOM_MASK.id,
      mode,
      suggestions: suggestions.slice(0, options?.numSuggestions || 3),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Claude API error:', error);

    // Return error as suggestion
    return {
      maskId: DOOM_MASK.id,
      mode,
      suggestions: [{
        id: nanoid(),
        content: error instanceof Error
          ? `Error channeling the villain: ${error.message}`
          : 'The mask stays silent... (API error)',
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
