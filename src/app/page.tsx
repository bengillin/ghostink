"use client";

import { useState, useCallback, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { RhymePanel } from "@/components/RhymePanel";
import { MaskPanel } from "@/components/MaskPanel";
import { AttributionBar } from "@/components/AttributionBar";
import { BeatControls } from "@/components/BeatControls";
import { SyllableDisplay } from "@/components/SyllableDisplay";
import { SongSidebar } from "@/components/SongSidebar";
import { Toolbar } from "@/components/Toolbar";
import { useSongStore } from "@/lib/store";
import { Chronicle } from "@/lib/chronicle";

type PanelType = "rhymes" | "mask" | "syllables";

export default function Home() {
  const {
    songs,
    currentSongId,
    isLoading,
    fetchSongs,
    createSong,
    updateContent,
    updateTitle,
    saveSong,
    undo,
    redo,
    getChronicle,
    getAttribution,
  } = useSongStore();

  const [selectedWord, setSelectedWord] = useState<string>("");
  const [activePanel, setActivePanel] = useState<PanelType>("rhymes");
  const [bpm, setBpm] = useState(90);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localChronicle, setLocalChronicle] = useState<Chronicle | null>(null);

  // Fetch songs on mount
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Create a new song if none exist after loading
  useEffect(() => {
    if (!isLoading && songs.size === 0) {
      createSong("Untitled");
    }
  }, [isLoading, songs.size, createSong]);

  // Get current song
  const currentSong = currentSongId ? songs.get(currentSongId) : undefined;
  const content = currentSong?.content || [""];

  // Get or create chronicle for current song
  useEffect(() => {
    if (currentSongId) {
      const chronicle = getChronicle(currentSongId);
      if (chronicle) {
        setLocalChronicle(chronicle);
      } else {
        setLocalChronicle(new Chronicle(currentSongId, "user-1", content));
      }
    }
  }, [currentSongId, getChronicle]);

  const handleContentChange = useCallback(
    (newContent: string[]) => {
      if (currentSongId) {
        updateContent(currentSongId, newContent);
      }
    },
    [currentSongId, updateContent]
  );

  const handleWordSelect = useCallback((word: string) => {
    setSelectedWord(word);
    setActivePanel("rhymes");
  }, []);

  const handleMaskInsert = useCallback(
    (text: string, maskId: string) => {
      if (!currentSongId || !localChronicle) return;

      const lastLine = content.length - 1;
      const lastChar = content[lastLine]?.length || 0;

      localChronicle.insertFromMask(
        { line: lastLine, character: lastChar },
        (lastChar > 0 ? "\n" : "") + text,
        maskId,
        0.85
      );

      const newContent = localChronicle.getContent();
      updateContent(currentSongId, newContent);
    },
    [currentSongId, localChronicle, content, updateContent]
  );

  const handleUndo = useCallback(() => {
    if (currentSongId) {
      const previousContent = undo(currentSongId);
      if (previousContent && localChronicle) {
        // Sync chronicle
      }
    }
  }, [currentSongId, undo, localChronicle]);

  const handleRedo = useCallback(() => {
    if (currentSongId) {
      const nextContent = redo(currentSongId);
      if (nextContent && localChronicle) {
        // Sync chronicle
      }
    }
  }, [currentSongId, redo, localChronicle]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (currentSongId) {
        updateTitle(currentSongId, e.target.value);
      }
    },
    [currentSongId, updateTitle]
  );

  const handleTitleBlur = useCallback(() => {
    if (currentSongId) {
      saveSong(currentSongId);
    }
  }, [currentSongId, saveSong]);

  // Auto-save on content change (debounced)
  useEffect(() => {
    if (!currentSongId) return;

    const timer = setTimeout(() => {
      saveSong(currentSongId);
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, currentSongId, saveSong]);

  const attribution = currentSongId ? getAttribution(currentSongId) : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ghost-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-ghost-border px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Toolbar
              songId={currentSongId}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onOpenSidebar={() => setSidebarOpen(true)}
            />

            <div className="w-px h-6 bg-ghost-border" />

            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-ghost-muted">Ghost</span>
              <span className="text-ghost-ink">Ink</span>
            </h1>

            <span className="text-ghost-muted">/</span>

            <input
              type="text"
              value={currentSong?.title || ""}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              placeholder="Song title..."
              className="bg-transparent border-none outline-none text-ghost-text text-sm font-medium focus:bg-ghost-surface px-2 py-1 rounded -ml-2"
            />
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
      <main className="flex-1 flex overflow-hidden">
        {/* Left side: Editor + Beat controls */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Beat controls toolbar */}
          <div className="border-b border-ghost-border p-3">
            <BeatControls initialBpm={bpm} onBpmChange={setBpm} />
          </div>

          {/* Editor */}
          {localChronicle && (
            <Editor
              content={content}
              onChange={handleContentChange}
              onWordSelect={handleWordSelect}
              chronicle={localChronicle}
            />
          )}

          {/* Attribution footer */}
          <div className="border-t border-ghost-border px-6 py-3">
            <div className="flex items-center gap-4">
              <span className="text-xs text-ghost-muted uppercase tracking-wide">
                Attribution
              </span>
              <div className="flex-1 max-w-xs">
                <AttributionBar
                  attribution={
                    attribution || {
                      songId: "",
                      totalCharacters: 0,
                      humanCharacters: 0,
                      maskContributions: [],
                      humanPercentage: 100,
                    }
                  }
                />
              </div>
              <span className="text-xs text-ghost-muted">
                {(attribution?.humanPercentage ?? 100).toFixed(0)}% you
              </span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <aside className="w-80 border-l border-ghost-border flex flex-col flex-shrink-0">
          {activePanel === "rhymes" && <RhymePanel selectedWord={selectedWord} />}
          {activePanel === "syllables" && <SyllableDisplay lines={content} bpm={bpm} />}
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

      {/* Song sidebar */}
      <SongSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
