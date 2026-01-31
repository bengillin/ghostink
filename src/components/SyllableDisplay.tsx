"use client";

import { useMemo } from "react";
import { countLineSyllables, getSyllableBreakdown, estimateBeatsNeeded } from "@/lib/beat";

interface SyllableDisplayProps {
  lines: string[];
  bpm?: number;
  targetSyllables?: number;  // Target syllables per line
}

export function SyllableDisplay({
  lines,
  bpm = 90,
  targetSyllables = 12,
}: SyllableDisplayProps) {
  const analysis = useMemo(() => {
    return lines.map((line, index) => {
      const syllables = countLineSyllables(line);
      const breakdown = getSyllableBreakdown(line);
      const beatsNeeded = estimateBeatsNeeded(line);
      const deviation = syllables - targetSyllables;

      return {
        lineNumber: index + 1,
        text: line,
        syllables,
        breakdown,
        beatsNeeded,
        deviation,
        isOnTarget: Math.abs(deviation) <= 2,
        isEmpty: line.trim().length === 0,
      };
    });
  }, [lines, targetSyllables]);

  const totalSyllables = analysis.reduce((sum, a) => sum + a.syllables, 0);
  const averageSyllables = lines.length > 0
    ? Math.round(totalSyllables / lines.filter(l => l.trim()).length)
    : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="panel-header flex items-center justify-between">
        <span>Syllables</span>
        <span className="text-xs normal-case tracking-normal text-ghost-muted">
          Avg: {averageSyllables}
        </span>
      </div>

      {/* Stats */}
      <div className="p-3 border-b border-ghost-border flex gap-4 text-xs">
        <div>
          <span className="text-ghost-muted">Total: </span>
          <span className="font-mono">{totalSyllables}</span>
        </div>
        <div>
          <span className="text-ghost-muted">Target: </span>
          <span className="font-mono">{targetSyllables}/line</span>
        </div>
        <div>
          <span className="text-ghost-muted">BPM: </span>
          <span className="font-mono">{bpm}</span>
        </div>
      </div>

      {/* Line-by-line breakdown */}
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {analysis.map((line) => (
          <div
            key={line.lineNumber}
            className={`p-2 rounded text-sm ${
              line.isEmpty
                ? "opacity-30"
                : line.isOnTarget
                ? "bg-green-500/10"
                : Math.abs(line.deviation) > 4
                ? "bg-red-500/10"
                : "bg-yellow-500/10"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-ghost-muted text-xs">
                Line {line.lineNumber}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                    line.isEmpty
                      ? "bg-ghost-border text-ghost-muted"
                      : line.isOnTarget
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {line.syllables} syl
                </span>
                <span className="text-xs text-ghost-muted">
                  ~{line.beatsNeeded} beats
                </span>
              </div>
            </div>

            {/* Word breakdown */}
            {!line.isEmpty && (
              <div className="flex flex-wrap gap-1">
                {line.breakdown.map((word, i) => (
                  <span
                    key={i}
                    className="text-xs px-1 py-0.5 rounded bg-ghost-bg"
                    title={`${word.syllables} syllable${word.syllables !== 1 ? "s" : ""}`}
                  >
                    {word.word}
                    <sup className="text-ghost-muted ml-0.5">{word.syllables}</sup>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-ghost-border">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-ghost-muted">On target</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-ghost-muted">Close</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-ghost-muted">Far off</span>
          </div>
        </div>
      </div>
    </div>
  );
}
