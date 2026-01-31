"use client";

import { useState, useEffect, useCallback } from "react";

// Import types only to avoid SSR issues with Web Audio
interface MetronomeState {
  isPlaying: boolean;
  currentBeat: number;
  currentBar: number;
  bpm: number;
}

interface BeatControlsProps {
  onBpmChange?: (bpm: number) => void;
  initialBpm?: number;
}

export function BeatControls({ onBpmChange, initialBpm = 90 }: BeatControlsProps) {
  const [bpm, setBpmState] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [metronomeModule, setMetronomeModule] = useState<typeof import("@/lib/beat/metronome") | null>(null);

  // Load metronome module on client side only
  useEffect(() => {
    import("@/lib/beat/metronome").then(setMetronomeModule);
  }, []);

  // Set up beat callback
  useEffect(() => {
    if (!metronomeModule) return;

    const unsubscribe = metronomeModule.onBeat((beat) => {
      setCurrentBeat(beat);
    });

    return () => unsubscribe();
  }, [metronomeModule]);

  const handleBpmChange = useCallback((newBpm: number) => {
    const clamped = Math.max(20, Math.min(300, newBpm));
    setBpmState(clamped);
    if (metronomeModule) {
      metronomeModule.setBpm(clamped);
    }
    onBpmChange?.(clamped);
  }, [metronomeModule, onBpmChange]);

  const handleToggle = useCallback(() => {
    if (!metronomeModule) return;
    const playing = metronomeModule.toggle(bpm);
    setIsPlaying(playing);
  }, [metronomeModule, bpm]);

  const handleTap = useCallback(() => {
    if (!metronomeModule) return;
    const tappedBpm = metronomeModule.tap();
    if (tappedBpm) {
      handleBpmChange(tappedBpm);
    }
  }, [metronomeModule, handleBpmChange]);

  // Common BPM presets for hip-hop
  const presets = [
    { label: "Slow", bpm: 70 },
    { label: "Boom Bap", bpm: 90 },
    { label: "Standard", bpm: 100 },
    { label: "Fast", bpm: 120 },
    { label: "Trap", bpm: 140 },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 bg-ghost-surface rounded-lg border border-ghost-border">
      {/* BPM Display */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-ghost-muted uppercase tracking-wide">Tempo</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBpmChange(bpm - 1)}
            className="w-6 h-6 rounded bg-ghost-bg hover:bg-ghost-border flex items-center justify-center text-ghost-muted hover:text-ghost-text"
          >
            -
          </button>
          <input
            type="number"
            value={bpm}
            onChange={(e) => handleBpmChange(parseInt(e.target.value) || 90)}
            className="w-16 bg-ghost-bg border border-ghost-border rounded px-2 py-1 text-center text-lg font-mono"
          />
          <button
            onClick={() => handleBpmChange(bpm + 1)}
            className="w-6 h-6 rounded bg-ghost-bg hover:bg-ghost-border flex items-center justify-center text-ghost-muted hover:text-ghost-text"
          >
            +
          </button>
          <span className="text-xs text-ghost-muted ml-1">BPM</span>
        </div>
      </div>

      {/* Beat indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((beat) => (
          <div
            key={beat}
            className={`w-3 h-3 rounded-full transition-colors ${
              isPlaying && currentBeat === beat
                ? beat === 1
                  ? "bg-ghost-accent"
                  : "bg-green-500"
                : "bg-ghost-border"
            }`}
          />
        ))}
        <span className="text-xs text-ghost-muted ml-2">
          {isPlaying ? `Beat ${currentBeat}` : "Stopped"}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          className={`flex-1 py-2 rounded font-medium text-sm transition-colors ${
            isPlaying
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
          }`}
        >
          {isPlaying ? (
            <span className="flex items-center justify-center gap-2">
              <StopIcon className="w-4 h-4" />
              Stop
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <PlayIcon className="w-4 h-4" />
              Play
            </span>
          )}
        </button>

        <button
          onClick={handleTap}
          className="px-4 py-2 rounded bg-ghost-bg hover:bg-ghost-border text-sm font-medium transition-colors"
        >
          Tap
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleBpmChange(preset.bpm)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              bpm === preset.bpm
                ? "bg-ghost-accent text-white"
                : "bg-ghost-bg text-ghost-muted hover:text-ghost-text"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" />
    </svg>
  );
}
