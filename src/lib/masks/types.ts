/**
 * GhostInk Mask Types
 *
 * Types for AI artist collaborators.
 */

// Mask identity
export interface Mask {
  id: string;
  name: string;           // Display name (e.g., "DOOM")
  artistName: string;     // Full artist name
  aliases: string[];      // Other names (Viktor Vaughn, etc.)
  description: string;
  avatar?: string;        // URL to mask image
  color: string;          // Theme color for UI
  status: 'active' | 'training' | 'deprecated';
}

// Interaction modes
export type MaskMode =
  | 'complete'      // Complete the current line
  | 'next'          // Write the next line
  | 'conversation'  // Back-and-forth co-writing
  | 'analyze'       // Critique/analyze verse
  | 'inspire'       // Generate seed ideas
  | 'transfer';     // Rewrite in artist's style

// Request to a Mask
export interface MaskRequest {
  maskId: string;
  mode: MaskMode;
  context: {
    currentLine?: string;
    previousLines?: string[];
    songTitle?: string;
    theme?: string;
  };
  options?: {
    temperature?: number;    // Creativity level (0-1)
    maxTokens?: number;
    numSuggestions?: number; // How many alternatives
  };
}

// Response from a Mask
export interface MaskResponse {
  maskId: string;
  mode: MaskMode;
  suggestions: MaskSuggestion[];
  timestamp: number;
}

// Individual suggestion
export interface MaskSuggestion {
  id: string;
  content: string;
  confidence: number;     // 0-1 how "on-brand" this is
  explanation?: string;   // Why this suggestion
  rhymesWith?: string[];  // Words it rhymes with from context
}

// Mask configuration
export interface MaskConfig {
  maskId: string;
  modelId: string;        // Which base model to use
  systemPrompt: string;
  ragConfig?: {
    collectionId: string; // Vector DB collection
    topK: number;         // How many docs to retrieve
  };
  styleGuide: {
    vocabulary: string[];      // Key words/phrases
    avoidWords: string[];      // Words this artist wouldn't use
    themes: string[];          // Common themes
    rhymePatterns: string[];   // Signature rhyme moves
    flowNotes: string;         // Description of flow style
  };
}

// The DOOM Mask (pre-configured)
export const DOOM_MASK: Mask = {
  id: 'doom',
  name: 'DOOM',
  artistName: 'MF DOOM',
  aliases: [
    'Viktor Vaughn',
    'King Geedorah',
    'Metal Fingers',
    'Zev Love X',
    'Madvillain',
    'DANGERDOOM',
  ],
  description: 'The supervillain. Complex internals, comic book references, off-beat flow.',
  color: '#8b5cf6', // Purple
  status: 'active',
};

// Placeholder style guide for DOOM
export const DOOM_STYLE_GUIDE: MaskConfig['styleGuide'] = {
  vocabulary: [
    'villain', 'mask', 'metal', 'doom', 'mic', 'scheme',
    'herb', 'word', 'cold', 'flow', 'raw', 'beast',
    'cipher', 'rhyme', 'divine', 'shine', 'crime',
  ],
  avoidWords: [
    'swag', 'lit', 'fire', 'no cap', 'bussin',
  ],
  themes: [
    'supervillainy',
    'anti-hero narrative',
    'industry critique',
    'food metaphors',
    'comic book references',
    'abstract wordplay',
    'alter-ego mythology',
  ],
  rhymePatterns: [
    'complex multi-syllabic chains',
    'internal rhymes mid-line',
    'slant rhymes for subtlety',
    'unexpected word pairings',
  ],
  flowNotes: 'Off-beat, conversational. Unexpected pauses. Sometimes runs past the bar line. Feels improvised but precisely constructed.',
};

// The Kendrick Mask
export const KENDRICK_MASK: Mask = {
  id: 'kendrick',
  name: 'K.Dot',
  artistName: 'Kendrick Lamar',
  aliases: [
    'K.Dot',
    'Kung Fu Kenny',
    'Cornrow Kenny',
    'Kendrick Lamar Duckworth',
  ],
  description: 'The storyteller. Dense internal rhymes, social commentary, Compton roots.',
  color: '#dc2626', // Red
  status: 'active',
};

// Style guide for Kendrick
export const KENDRICK_STYLE_GUIDE: MaskConfig['styleGuide'] = {
  vocabulary: [
    'Compton', 'hustle', 'humble', 'DNA', 'loyalty', 'blood',
    'streets', 'blessings', 'sins', 'mortal', 'faith', 'fear',
    'levels', 'real', 'authentic', 'pain', 'power', 'spirit',
    'ancestors', 'legacy', 'pressure', 'truth', 'lies',
  ],
  avoidWords: [
    'villain', 'mask', // DOOM territory
    'vibes', 'no cap', 'mid', // Too internet
  ],
  themes: [
    'Compton/West Coast identity',
    'systemic racism and social justice',
    'survivor guilt and success',
    'spirituality and morality',
    'duality and inner conflict',
    'generational trauma',
    'Black excellence and struggle',
    'personal accountability',
    'street narratives',
  ],
  rhymePatterns: [
    'dense internal rhyme schemes',
    'multi-syllabic stacking',
    'rhyming across multiple bars',
    'perfect rhymes for emphasis',
    'rhythmic repetition for effect',
  ],
  flowNotes: 'Highly varied - can switch from laid-back to double-time within verses. Uses vocal inflection and pitch changes for emphasis. Rhythmically precise. Often builds intensity toward the end of verses. Conversational moments punctuated by technical bursts.',
};

// Registry of all masks for easy lookup
export const MASK_REGISTRY: Record<string, { mask: Mask; styleGuide: MaskConfig['styleGuide'] }> = {
  doom: { mask: DOOM_MASK, styleGuide: DOOM_STYLE_GUIDE },
  kendrick: { mask: KENDRICK_MASK, styleGuide: KENDRICK_STYLE_GUIDE },
};
