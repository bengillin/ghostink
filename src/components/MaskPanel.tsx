"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DOOM_MASK,
  KENDRICK_MASK,
  type Mask,
  type MaskMode,
  type MaskSuggestion,
  type MaskResponse,
} from "@/lib/masks";

interface MaskPanelProps {
  onInsert: (text: string, maskId: string) => void;
  context: {
    currentLine?: string;
    previousLines?: string[];
  };
}

// Available masks (in order of display)
const AVAILABLE_MASKS: Mask[] = [DOOM_MASK, KENDRICK_MASK];

const MODES: { id: MaskMode; label: string; description: string }[] = [
  { id: "complete", label: "Complete", description: "Finish this line" },
  { id: "next", label: "Next Line", description: "Write the next bar" },
  { id: "analyze", label: "Analyze", description: "Critique my verse" },
  { id: "inspire", label: "Inspire", description: "Give me ideas" },
  { id: "transfer", label: "Transfer", description: "Rewrite in style" },
  { id: "conversation", label: "Cipher", description: "Back and forth" },
];

export function MaskPanel({ onInsert, context }: MaskPanelProps) {
  const [selectedMask, setSelectedMask] = useState<Mask>(DOOM_MASK);
  const [mode, setMode] = useState<MaskMode>("complete");
  const [suggestions, setSuggestions] = useState<MaskSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claudeAvailable, setClaudeAvailable] = useState<boolean | null>(null);

  // Check if Claude API is available
  useEffect(() => {
    fetch("/api/masks/generate")
      .then((res) => res.json())
      .then((data) => setClaudeAvailable(data.claudeAvailable))
      .catch(() => setClaudeAvailable(false));
  }, []);

  // Clear suggestions when mask changes
  useEffect(() => {
    setSuggestions([]);
  }, [selectedMask]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/masks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maskId: selectedMask.id,
          mode,
          context: {
            currentLine: context.currentLine,
            previousLines: context.previousLines,
          },
          options: {
            numSuggestions: 3,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data: MaskResponse = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError("Failed to generate. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mode, context, selectedMask]);

  const handleInsert = useCallback(
    (suggestion: MaskSuggestion) => {
      onInsert(suggestion.content, selectedMask.id);
    },
    [onInsert, selectedMask]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Mask Selector */}
      <div className="p-3 border-b border-ghost-border">
        <div className="flex gap-2">
          {AVAILABLE_MASKS.map((mask) => (
            <button
              key={mask.id}
              onClick={() => setSelectedMask(mask)}
              className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                selectedMask.id === mask.id
                  ? "border-current"
                  : "border-transparent hover:border-ghost-border"
              }`}
              style={{
                backgroundColor: selectedMask.id === mask.id ? `${mask.color}15` : undefined,
                color: selectedMask.id === mask.id ? mask.color : undefined,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: mask.color }}
                >
                  <MaskIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{mask.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Header with selected mask info */}
      <div className="panel-header flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: selectedMask.color }}
        >
          <MaskIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-ghost-ink font-semibold">{selectedMask.artistName}</div>
          <div className="text-xs text-ghost-muted normal-case tracking-normal">
            {selectedMask.description.split('.')[0]}
          </div>
        </div>
        {claudeAvailable !== null && (
          <div
            className={`text-xs px-2 py-1 rounded ${
              claudeAvailable
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
            title={claudeAvailable ? "Claude API connected" : "Using mock responses"}
          >
            {claudeAvailable ? "Live" : "Demo"}
          </div>
        )}
      </div>

      {/* Mode selector */}
      <div className="p-4 border-b border-ghost-border">
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`p-2 rounded text-xs text-center transition-colors ${
                mode === m.id
                  ? "text-white"
                  : "bg-ghost-surface text-ghost-muted hover:text-ghost-text"
              }`}
              style={{
                backgroundColor: mode === m.id ? selectedMask.color : undefined,
              }}
              title={m.description}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-ghost-muted mt-2 text-center">
          {MODES.find((m) => m.id === mode)?.description}
        </p>
      </div>

      {/* Context preview */}
      <div className="p-4 border-b border-ghost-border">
        <div className="text-xs text-ghost-muted uppercase tracking-wide mb-2">
          Context
        </div>
        <div className="bg-ghost-bg rounded p-3 font-mono text-sm max-h-24 overflow-auto">
          {context.previousLines?.slice(-2).map((line, i) => (
            <div key={i} className="text-ghost-muted">
              {line || <span className="italic">empty line</span>}
            </div>
          ))}
          <div className="text-ghost-ink">
            {context.currentLine || (
              <span className="text-ghost-muted italic">current line empty</span>
            )}
            <span className="animate-pulse">|</span>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="p-4 border-b border-ghost-border">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn w-full text-white"
          style={{ backgroundColor: selectedMask.color }}
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <LoadingSpinner className="w-4 h-4" />
              Channeling...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <SparklesIcon className="w-4 h-4" />
              Summon {selectedMask.name}
            </span>
          )}
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="text-red-400 text-sm text-center py-4">{error}</div>
        )}

        {suggestions.length === 0 && !loading && !error && (
          <div className="text-center text-ghost-muted py-8">
            <p className="text-sm">Select a mode and summon {selectedMask.name}</p>
            <p className="text-xs mt-2">Suggestions will appear here</p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3 animate-slide-up">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-ghost-surface rounded-lg p-4 border border-ghost-border hover:border-opacity-50 transition-colors"
                style={{ '--hover-border': selectedMask.color } as React.CSSProperties}
              >
                <div className="font-mono text-sm mb-3 text-ghost-ink leading-relaxed">
                  "{suggestion.content}"
                </div>

                {suggestion.explanation && (
                  <p className="text-xs text-ghost-muted mb-3">
                    {suggestion.explanation}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: `${selectedMask.color}20`,
                        color: selectedMask.color,
                      }}
                    >
                      {(suggestion.confidence * 100).toFixed(0)}% {selectedMask.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleInsert(suggestion)}
                    className="btn btn-ghost text-xs py-1 px-3"
                  >
                    Insert
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mask info footer */}
      <div className="border-t border-ghost-border p-4">
        <details className="text-xs">
          <summary className="text-ghost-muted cursor-pointer hover:text-ghost-text">
            About {selectedMask.name}
          </summary>
          <div className="mt-2 space-y-2 text-ghost-muted">
            <p>{selectedMask.description}</p>
            <p>
              <strong>Aliases:</strong> {selectedMask.aliases.join(", ")}
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

function MaskIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-2 5.5c2.21 0 4-1.79 4-4h-8c0 2.21 1.79 4 4 4z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
