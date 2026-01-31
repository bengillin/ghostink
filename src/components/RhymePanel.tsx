"use client";

import { useState, useEffect } from "react";
import { findRhymes, type RhymeResult, type RhymeType } from "@/lib/rhyme";

interface RhymePanelProps {
  selectedWord: string;
}

const TYPE_LABELS: Record<RhymeType, string> = {
  perfect: "Perfect",
  slant: "Slant",
  assonance: "Assonance",
  consonance: "Consonance",
  multisyllabic: "Multi",
  identity: "Identity",
  internal: "Internal",
  mosaic: "Mosaic",
};

const TYPE_DESCRIPTIONS: Record<RhymeType, string> = {
  perfect: "Identical ending sounds",
  slant: "Similar but not identical",
  assonance: "Matching vowel sounds",
  consonance: "Matching consonant sounds",
  multisyllabic: "Multiple syllables rhyme",
  identity: "Same word or homophone",
  internal: "Rhyme within a line",
  mosaic: "Multiple words = one",
};

export function RhymePanel({ selectedWord }: RhymePanelProps) {
  const [results, setResults] = useState<RhymeResult | null>(null);
  const [activeTab, setActiveTab] = useState<RhymeType>("perfect");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (selectedWord) {
      setSearchInput(selectedWord);
      const result = findRhymes({
        word: selectedWord,
        types: ["perfect", "slant", "assonance", "consonance", "multisyllabic"],
        minScore: 0.4,
        limit: 15,
      });
      setResults(result);

      // Auto-select first tab with results
      if (result.matches.perfect?.length) {
        setActiveTab("perfect");
      } else if (result.matches.slant?.length) {
        setActiveTab("slant");
      } else if (result.matches.multisyllabic?.length) {
        setActiveTab("multisyllabic");
      }
    }
  }, [selectedWord]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      const word = searchInput.trim().toLowerCase().replace(/[^a-z]/g, "");
      const result = findRhymes({
        word,
        types: ["perfect", "slant", "assonance", "consonance", "multisyllabic"],
        minScore: 0.4,
        limit: 15,
      });
      setResults(result);
    }
  };

  const availableTabs = results
    ? (Object.keys(results.matches) as RhymeType[]).filter(
        (type) => results.matches[type]?.length
      )
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="panel-header flex items-center justify-between">
        <span>Rhymebook</span>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-ghost-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search for rhymes..."
            className="flex-1 bg-ghost-bg border border-ghost-border rounded px-3 py-2 text-sm focus:outline-none focus:border-ghost-accent"
          />
          <button onClick={handleSearch} className="btn btn-primary px-3">
            <SearchIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      {results && availableTabs.length > 0 && (
        <div className="flex border-b border-ghost-border overflow-x-auto">
          {availableTabs.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-4 py-2 text-xs font-medium uppercase tracking-wide whitespace-nowrap ${
                activeTab === type
                  ? "text-ghost-accent border-b-2 border-ghost-accent"
                  : "text-ghost-muted hover:text-ghost-text"
              }`}
            >
              {TYPE_LABELS[type]} ({results.matches[type]?.length || 0})
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-auto p-4">
        {!results && (
          <div className="text-center text-ghost-muted py-8">
            <p className="text-sm">Select a word or search to find rhymes</p>
          </div>
        )}

        {results && availableTabs.length === 0 && (
          <div className="text-center text-ghost-muted py-8">
            <p className="text-sm">No rhymes found for "{results.query}"</p>
            <p className="text-xs mt-2">Try a different word</p>
          </div>
        )}

        {results && results.matches[activeTab] && (
          <div className="space-y-1 animate-fade-in">
            <p className="text-xs text-ghost-muted mb-3">
              {TYPE_DESCRIPTIONS[activeTab]}
            </p>
            {results.matches[activeTab]!.map((match) => (
              <div
                key={match.word}
                className="flex items-center justify-between py-2 px-3 rounded hover:bg-ghost-surface cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono">{match.word}</span>
                  <span className="text-xs text-ghost-muted">
                    {match.syllables} syl
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ghost-muted">
                    {(match.score * 100).toFixed(0)}%
                  </span>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-ghost-muted hover:text-ghost-accent transition-opacity"
                    title="Copy"
                  >
                    <CopyIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rhyme type legend */}
      <div className="border-t border-ghost-border p-4">
        <details className="text-xs">
          <summary className="text-ghost-muted cursor-pointer hover:text-ghost-text">
            Rhyme Types
          </summary>
          <div className="mt-2 space-y-1">
            {Object.entries(TYPE_DESCRIPTIONS).slice(0, 5).map(([type, desc]) => (
              <div key={type} className="flex justify-between">
                <span className="text-ghost-muted">{TYPE_LABELS[type as RhymeType]}</span>
                <span className="text-ghost-text">{desc}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
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
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
