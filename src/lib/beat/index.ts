/**
 * GhostInk Beat Module
 *
 * BPM, metronome, and syllable timing.
 */

export * from './types';
export {
  countWordSyllables,
  countLineSyllables,
  getSyllableBreakdown,
  estimateBeatsNeeded,
  matchesSyllableTarget,
  splitIntoSyllables,
} from './syllables';
export {
  start as startMetronome,
  stop as stopMetronome,
  toggle as toggleMetronome,
  setBpm,
  getState as getMetronomeState,
  onBeat,
  tap as tapTempo,
  beatDuration,
  barDuration,
  generateBeatGrid,
} from './metronome';
