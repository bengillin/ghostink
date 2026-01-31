"use client";

import { useMemo } from "react";
import { analyzeRhymeScheme, getActiveDictionary, getRhymePortion, stripStress } from "@/lib/rhyme";

interface RhymeHighlighterProps {
  lines: string[];
}

// Colors for rhyme schemes
const RHYME_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "rgba(239, 68, 68, 0.2)", text: "#ef4444" },
  B: { bg: "rgba(59, 130, 246, 0.2)", text: "#3b82f6" },
  C: { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e" },
  D: { bg: "rgba(249, 115, 22, 0.2)", text: "#f97316" },
  E: { bg: "rgba(168, 85, 247, 0.2)", text: "#a855f7" },
  F: { bg: "rgba(236, 72, 153, 0.2)", text: "#ec4899" },
  G: { bg: "rgba(234, 179, 8, 0.2)", text: "#eab308" },
  H: { bg: "rgba(6, 182, 212, 0.2)", text: "#06b6d4" },
};

export interface RhymeInfo {
  lineIndex: number;
  wordIndex: number;
  word: string;
  scheme: string;
  color: { bg: string; text: string };
}

/**
 * Analyze lines and return rhyme information for highlighting
 */
export function useRhymeHighlighting(lines: string[]): {
  scheme: string[];
  rhymeWords: RhymeInfo[];
  getRhymeColor: (lineIndex: number) => { bg: string; text: string } | null;
} {
  return useMemo(() => {
    const scheme = analyzeRhymeScheme(lines);
    const rhymeWords: RhymeInfo[] = [];

    // Find the last word of each line and its rhyme scheme
    lines.forEach((line, lineIndex) => {
      const words = line.trim().split(/\s+/);
      if (words.length === 0 || !words[words.length - 1]) return;

      const lastWord = words[words.length - 1];
      const schemeChar = scheme[lineIndex];

      if (schemeChar && schemeChar !== "-" && schemeChar !== "?") {
        const color = RHYME_COLORS[schemeChar] || RHYME_COLORS.A;
        rhymeWords.push({
          lineIndex,
          wordIndex: words.length - 1,
          word: lastWord,
          scheme: schemeChar,
          color,
        });
      }
    });

    const getRhymeColor = (lineIndex: number) => {
      const schemeChar = scheme[lineIndex];
      if (!schemeChar || schemeChar === "-" || schemeChar === "?") return null;
      return RHYME_COLORS[schemeChar] || null;
    };

    return { scheme, rhymeWords, getRhymeColor };
  }, [lines]);
}

/**
 * Render a line with rhyme highlighting on the last word
 */
export function HighlightedLine({
  line,
  lineIndex,
  rhymeColor,
}: {
  line: string;
  lineIndex: number;
  rhymeColor: { bg: string; text: string } | null;
}) {
  if (!rhymeColor || !line.trim()) {
    return <>{line}</>;
  }

  const words = line.split(/(\s+)/); // Split keeping whitespace
  const lastWordIndex = words.reduce(
    (last, word, i) => (word.trim() ? i : last),
    -1
  );

  if (lastWordIndex === -1) {
    return <>{line}</>;
  }

  return (
    <>
      {words.map((segment, i) => {
        if (i === lastWordIndex) {
          return (
            <span
              key={i}
              style={{
                backgroundColor: rhymeColor.bg,
                color: rhymeColor.text,
                borderRadius: "2px",
                padding: "0 2px",
              }}
            >
              {segment}
            </span>
          );
        }
        return <span key={i}>{segment}</span>;
      })}
    </>
  );
}

/**
 * Get internal rhymes within a line
 */
export function findInternalRhymes(line: string): { word1: string; word2: string; position1: number; position2: number }[] {
  const dict = getActiveDictionary();
  const words = line.toLowerCase().replace(/[^a-z\s'-]/g, "").split(/\s+/).filter(Boolean);
  const internalRhymes: { word1: string; word2: string; position1: number; position2: number }[] = [];

  // Compare each word with later words
  for (let i = 0; i < words.length - 1; i++) {
    const word1 = dict.lookup(words[i]);
    if (!word1) continue;

    for (let j = i + 1; j < words.length; j++) {
      const word2 = dict.lookup(words[j]);
      if (!word2 || words[i] === words[j]) continue;

      // Check if they rhyme (same rhyme portion)
      const rhyme1 = getRhymePortion(word1.phonemes).map(stripStress).join("-");
      const rhyme2 = getRhymePortion(word2.phonemes).map(stripStress).join("-");

      if (rhyme1 === rhyme2) {
        internalRhymes.push({
          word1: words[i],
          word2: words[j],
          position1: i,
          position2: j,
        });
      }
    }
  }

  return internalRhymes;
}
