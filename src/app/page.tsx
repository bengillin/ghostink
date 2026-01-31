"use client";

import { useState, useCallback } from "react";
import { Editor } from "@/components/Editor";
import { RhymePanel } from "@/components/RhymePanel";
import { MaskPanel } from "@/components/MaskPanel";
import { AttributionBar } from "@/components/AttributionBar";
import { BeatControls } from "@/components/BeatControls";
import { SyllableDisplay } from "@/components/SyllableDisplay";
import { Chronicle } from "@/lib/chronicle";

type PanelType = "rhymes" | "mask" | "syllables";

export default function Home() {
  const [chronicle] = useState(() => new Chronicle("song-1", "user-1", [""]));
  const [content, setContent] = useState<string[]>(chronicle.getContent());
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [activePanel, setActivePanel] = useState<PanelType>("rhymes");
  const [bpm, setBpm] = useState(90);

  const handleContentChange = useCallback(
    (newContent: string[]) => {
      setContent(newContent);
    },
    []
  );

  const handleWordSelect = useCallback((word: string) => {
    setSelectedWord(word);
    // Auto-switch to rhymes panel when word selected
    setActivePanel("rhymes");
  }, []);

  const handleMaskInsert = useCallback(
    (text: string, maskId: string) => {
      // Insert at end of current content
      const lastLine = content.length - 1;
      const lastChar = content[lastLine]?.length || 0;

      chronicle.insertFromMask(
        { line: lastLine, character: lastChar },
        (lastChar > 0 ? "\n" : "") + text,
        maskId,
        0.85
      );

      setContent(chronicle.getContent());
    },
    [chronicle, content]
  );

  const attribution = chronicle.getAttribution();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-ghost-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-ghost-muted">Ghost</span>
              <span className="text-ghost-ink">Ink</span>
            </h1>
            <span className="text-ghost-muted text-sm">/ Untitled Song</span>
          </div>

          {/* Panel tabs */}
          <div className="flex items-center gap-1 bg-ghost-surface rounded-lg p-1">
            <button
              onClick={() => setActivePanel("rhymes")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activePanel === "rhymes"
                  ? "bg-ghost-accent text-white"
                  : "text-ghost-muted hover:text-ghost-text"
              }`}
            >
              Rhymes
            </button>
            <button
              onClick={() => setActivePanel("syllables")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activePanel === "syllables"
                  ? "bg-ghost-accent text-white"
                  : "text-ghost-muted hover:text-ghost-text"
              }`}
            >
              Syllables
            </button>
            <button
              onClick={() => setActivePanel("mask")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activePanel === "mask"
                  ? "bg-ghost-accent text-white"
                  : "text-ghost-muted hover:text-ghost-text"
              }`}
            >
              <MaskIcon className="w-4 h-4" />
              DOOM
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex">
        {/* Left side: Editor + Beat controls */}
        <div className="flex-1 flex flex-col">
          {/* Beat controls toolbar */}
          <div className="border-b border-ghost-border p-3">
            <BeatControls
              initialBpm={bpm}
              onBpmChange={setBpm}
            />
          </div>

          {/* Editor */}
          <Editor
            content={content}
            onChange={handleContentChange}
            onWordSelect={handleWordSelect}
            chronicle={chronicle}
          />

          {/* Attribution footer */}
          <div className="border-t border-ghost-border px-6 py-3">
            <div className="flex items-center gap-4">
              <span className="text-xs text-ghost-muted uppercase tracking-wide">
                Attribution
              </span>
              <div className="flex-1 max-w-xs">
                <AttributionBar attribution={attribution} />
              </div>
              <span className="text-xs text-ghost-muted">
                {attribution.humanPercentage.toFixed(0)}% you
              </span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <aside className="w-80 border-l border-ghost-border flex flex-col">
          {activePanel === "rhymes" && (
            <RhymePanel selectedWord={selectedWord} />
          )}
          {activePanel === "syllables" && (
            <SyllableDisplay lines={content} bpm={bpm} />
          )}
          {activePanel === "mask" && (
            <MaskPanel
              onInsert={handleMaskInsert}
              context={{
                currentLine: content[content.length - 1] || "",
                previousLines: content.slice(0, -1),
              }}
            />
          )}
        </aside>
      </main>
    </div>
  );
}

function MaskIcon({ className }: { className?: string }) {
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
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M9 9h.01M15 9h.01" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    </svg>
  );
}
