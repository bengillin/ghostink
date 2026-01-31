/**
 * GhostInk Beat Types
 *
 * Types for BPM, timing, and syllable sync.
 */

// Beat configuration
export interface BeatConfig {
  bpm: number;                    // Beats per minute
  timeSignature: [number, number]; // e.g., [4, 4] for 4/4
  swing?: number;                 // Swing amount (0-1)
}

// A bar (measure) of music
export interface Bar {
  number: number;
  beats: Beat[];
  durationMs: number;
}

// A single beat
export interface Beat {
  number: number;                 // Beat number within bar (1-indexed)
  startMs: number;                // Start time in ms
  durationMs: number;             // Duration in ms
  isDownbeat: boolean;            // First beat of bar
  subdivisions?: BeatSubdivision[];
}

// Beat subdivision (for syncopation)
export interface BeatSubdivision {
  position: number;               // 0-1 within beat
  startMs: number;
  durationMs: number;
}

// Syllable with timing
export interface TimedSyllable {
  text: string;
  startBeat: number;              // Which beat (can be fractional)
  duration: number;               // Duration in beats
  stressed: boolean;              // Is this syllable stressed
}

// Line with syllable timing
export interface TimedLine {
  text: string;
  syllables: TimedSyllable[];
  totalBeats: number;
  startBar: number;
  endBar: number;
}

// Metronome state
export interface MetronomeState {
  isPlaying: boolean;
  currentBeat: number;
  currentBar: number;
  startTime: number;
  bpm: number;
}
