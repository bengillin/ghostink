/**
 * GhostInk Metronome
 *
 * Accurate metronome using Web Audio API scheduling.
 */

import type { BeatConfig, MetronomeState, Beat, Bar } from './types';

// Audio context (created lazily)
let audioContext: AudioContext | null = null;

// Metronome state
let state: MetronomeState = {
  isPlaying: false,
  currentBeat: 1,
  currentBar: 1,
  startTime: 0,
  bpm: 90,
};

// Callbacks
type BeatCallback = (beat: number, bar: number, time: number) => void;
let onBeatCallbacks: BeatCallback[] = [];

// Scheduler state
let nextBeatTime = 0;
let schedulerInterval: NodeJS.Timeout | null = null;
const SCHEDULE_AHEAD_TIME = 0.1; // Schedule 100ms ahead
const SCHEDULER_INTERVAL = 25; // Check every 25ms

/**
 * Get or create audio context
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Calculate beat duration in seconds
 */
export function beatDuration(bpm: number): number {
  return 60 / bpm;
}

/**
 * Calculate bar duration in seconds
 */
export function barDuration(bpm: number, beatsPerBar: number = 4): number {
  return beatDuration(bpm) * beatsPerBar;
}

/**
 * Play a click sound
 */
function playClick(time: number, isDownbeat: boolean): void {
  const ctx = getAudioContext();

  // Create oscillator
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Downbeat is higher pitched
  osc.frequency.value = isDownbeat ? 1000 : 800;
  osc.type = 'sine';

  // Short click envelope
  gain.gain.setValueAtTime(isDownbeat ? 0.5 : 0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

  osc.start(time);
  osc.stop(time + 0.05);
}

/**
 * Schedule upcoming beats
 */
function scheduler(): void {
  const ctx = getAudioContext();

  while (nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
    const isDownbeat = state.currentBeat === 1;

    // Play click
    playClick(nextBeatTime, isDownbeat);

    // Notify callbacks
    const beatTime = nextBeatTime;
    const beat = state.currentBeat;
    const bar = state.currentBar;

    setTimeout(() => {
      for (const cb of onBeatCallbacks) {
        cb(beat, bar, beatTime);
      }
    }, (beatTime - ctx.currentTime) * 1000);

    // Advance to next beat
    nextBeatTime += beatDuration(state.bpm);
    state.currentBeat++;

    if (state.currentBeat > 4) {
      state.currentBeat = 1;
      state.currentBar++;
    }
  }
}

/**
 * Start the metronome
 */
export function start(bpm: number = 90): void {
  if (state.isPlaying) return;

  const ctx = getAudioContext();

  // Resume audio context if suspended
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  state = {
    isPlaying: true,
    currentBeat: 1,
    currentBar: 1,
    startTime: ctx.currentTime,
    bpm,
  };

  nextBeatTime = ctx.currentTime;

  // Start scheduler
  schedulerInterval = setInterval(scheduler, SCHEDULER_INTERVAL);
}

/**
 * Stop the metronome
 */
export function stop(): void {
  state.isPlaying = false;

  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

/**
 * Toggle metronome
 */
export function toggle(bpm?: number): boolean {
  if (state.isPlaying) {
    stop();
  } else {
    start(bpm || state.bpm);
  }
  return state.isPlaying;
}

/**
 * Set BPM (while playing or stopped)
 */
export function setBpm(bpm: number): void {
  state.bpm = Math.max(20, Math.min(300, bpm));
}

/**
 * Get current state
 */
export function getState(): MetronomeState {
  return { ...state };
}

/**
 * Register beat callback
 */
export function onBeat(callback: BeatCallback): () => void {
  onBeatCallbacks.push(callback);
  return () => {
    onBeatCallbacks = onBeatCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Tap tempo - call this repeatedly to set BPM from taps
 */
let tapTimes: number[] = [];
const TAP_TIMEOUT = 2000; // Reset after 2s of no taps

export function tap(): number | null {
  const now = Date.now();

  // Reset if too long since last tap
  if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > TAP_TIMEOUT) {
    tapTimes = [];
  }

  tapTimes.push(now);

  // Need at least 2 taps
  if (tapTimes.length < 2) return null;

  // Keep only last 8 taps
  if (tapTimes.length > 8) {
    tapTimes = tapTimes.slice(-8);
  }

  // Calculate average interval
  let totalInterval = 0;
  for (let i = 1; i < tapTimes.length; i++) {
    totalInterval += tapTimes[i] - tapTimes[i - 1];
  }
  const avgInterval = totalInterval / (tapTimes.length - 1);

  // Convert to BPM
  const bpm = Math.round(60000 / avgInterval);

  // Clamp to reasonable range
  return Math.max(20, Math.min(300, bpm));
}

/**
 * Generate beat grid for visualization
 */
export function generateBeatGrid(
  bpm: number,
  bars: number,
  beatsPerBar: number = 4
): Bar[] {
  const beatDur = beatDuration(bpm) * 1000; // in ms
  const grid: Bar[] = [];
  let currentTime = 0;

  for (let bar = 0; bar < bars; bar++) {
    const beats: Beat[] = [];

    for (let beat = 0; beat < beatsPerBar; beat++) {
      beats.push({
        number: beat + 1,
        startMs: currentTime,
        durationMs: beatDur,
        isDownbeat: beat === 0,
      });
      currentTime += beatDur;
    }

    grid.push({
      number: bar + 1,
      beats,
      durationMs: beatDur * beatsPerBar,
    });
  }

  return grid;
}
