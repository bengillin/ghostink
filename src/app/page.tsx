"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Editor } from "@/components/Editor";
import { RhymePanel } from "@/components/RhymePanel";
import { MaskPanel } from "@/components/MaskPanel";
import { AttributionBar } from "@/components/AttributionBar";
import { SyllableDisplay } from "@/components/SyllableDisplay";
import { SongSidebar } from "@/components/SongSidebar";
import { SettingsModal } from "@/components/SettingsModal";
import { Toolbar } from "@/components/Toolbar";
import { useSongStore } from "@/lib/store";
import { Chronicle } from "@/lib/chronicle";
import { DOOM_MASK, KENDRICK_MASK, type Mask, type MaskMode } from "@/lib/masks";

type PanelType = "rhymes" | "mask" | "syllables";

const AVAILABLE_MASKS: Mask[] = [DOOM_MASK, KENDRICK_MASK];

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localChronicle, setLocalChronicle] = useState<Chronicle | null>(null);
  const [selectedMask, setSelectedMask] = useState<Mask>(DOOM_MASK);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const hasCreatedRef = useRef(false);
  const editorRef = useRef<{ focus: () => void; insertText: (text: string) => void } | null>(null);

  // Fetch songs on mount (only once)
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create a new song if none exist after loading
  useEffect(() => {
    if (!isLoading && songs.size === 0 && !hasCreatedRef.current) {
      hasCreatedRef.current = true;
      createSong("Untitled");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, songs.size]);

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

  // Show notification briefly
  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  // Generate from mask and auto-insert
  const generateAndInsert = useCallback(async (mode: MaskMode) => {
    if (isGenerating || !currentSongId) return;

    setIsGenerating(true);
    showNotification(`${selectedMask.name} is writing...`);

    try {
      const response = await fetch("/api/masks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maskId: selectedMask.id,
          mode,
          context: {
            currentLine: content[content.length - 1] || "",
            previousLines: content.slice(0, -1),
          },
          options: { numSuggestions: 1 },
        }),
      });

      if (!response.ok) throw new Error("API failed");

      const data = await response.json();
      const suggestion = data.suggestions?.[0];

      if (suggestion?.content) {
        // Auto-insert the suggestion
        handleMaskInsert(suggestion.content, selectedMask.id);
        showNotification(`${selectedMask.name}: inserted`);
      }
    } catch (err) {
      showNotification("Generation failed");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, currentSongId, selectedMask, content, showNotification]);

  // Handle inline commands (e.g., /complete, /next)
  const handleInlineCommand = useCallback((command: string): boolean => {
    const cmd = command.toLowerCase().trim();
    const modeMap: Record<string, MaskMode> = {
      '/complete': 'complete',
      '/next': 'next',
      '/analyze': 'analyze',
      '/inspire': 'inspire',
      '/transfer': 'transfer',
      '/cipher': 'conversation',
    };

    if (modeMap[cmd]) {
      generateAndInsert(modeMap[cmd]);
      return true; // Command was handled
    }
    return false;
  }, [generateAndInsert]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + J = Complete line
      if (isMod && e.key === 'j') {
        e.preventDefault();
        generateAndInsert('complete');
        return;
      }

      // Cmd/Ctrl + K = Next line
      if (isMod && e.key === 'k' && !e.shiftKey) {
        e.preventDefault();
        generateAndInsert('next');
        return;
      }

      // Cmd/Ctrl + Shift + K = Inspire
      if (isMod && e.key === 'k' && e.shiftKey) {
        e.preventDefault();
        generateAndInsert('inspire');
        return;
      }

      // Cmd/Ctrl + Shift + A = Analyze
      if (isMod && e.key === 'a' && e.shiftKey) {
        e.preventDefault();
        generateAndInsert('analyze');
        return;
      }

      // Cmd/Ctrl + M = Cycle mask
      if (isMod && e.key === 'm') {
        e.preventDefault();
        const currentIndex = AVAILABLE_MASKS.findIndex(m => m.id === selectedMask.id);
        const nextIndex = (currentIndex + 1) % AVAILABLE_MASKS.length;
        setSelectedMask(AVAILABLE_MASKS[nextIndex]);
        showNotification(`Switched to ${AVAILABLE_MASKS[nextIndex].name}`);
        return;
      }

      // Cmd/Ctrl + , = Settings
      if (isMod && e.key === ',') {
        e.preventDefault();
        setSettingsOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generateAndInsert, selectedMask, showNotification]);

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
      undo(currentSongId);
    }
  }, [currentSongId, undo]);

  const handleRedo = useCallback(() => {
    if (currentSongId) {
      redo(currentSongId);
    }
  }, [currentSongId, redo]);

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
      {/* Notification toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-ghost-surface border border-ghost-border rounded-lg shadow-lg text-sm animate-fade-in">
          {isGenerating && <LoadingSpinner className="w-4 h-4 inline mr-2" />}
          {notification}
        </div>
      )}

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

          <div className="flex items-center gap-3">
            {/* Global Mask Selector */}
            <div className="flex items-center gap-1 bg-ghost-surface rounded-lg p-1">
              {AVAILABLE_MASKS.map((mask) => (
                <button
                  key={mask.id}
                  onClick={() => setSelectedMask(mask)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedMask.id === mask.id
                      ? "text-white"
                      : "text-ghost-muted hover:text-ghost-text"
                  }`}
                  style={{
                    backgroundColor: selectedMask.id === mask.id ? mask.color : undefined,
                  }}
                  title={`Switch to ${mask.name} (⌘M to cycle)`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedMask.id === mask.id ? 'white' : mask.color }}
                  />
                  {mask.name}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-ghost-border" />

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
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  activePanel === "mask"
                    ? "bg-ghost-accent text-white"
                    : "text-ghost-muted hover:text-ghost-text"
                }`}
              >
                AI Panel
              </button>
            </div>

            {/* Settings button */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-ghost-muted hover:text-ghost-text rounded transition-colors"
              title="Settings (⌘,)"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Shortcuts hint bar */}
      <div className="border-b border-ghost-border px-4 py-1.5 bg-ghost-surface/50 flex items-center justify-center gap-6 text-xs text-ghost-muted">
        <span><kbd className="kbd">⌘J</kbd> complete</span>
        <span><kbd className="kbd">⌘K</kbd> next line</span>
        <span><kbd className="kbd">⌘⇧K</kbd> inspire</span>
        <span><kbd className="kbd">⌘M</kbd> switch mask</span>
        <span className="text-ghost-muted/50">or type <code className="text-ghost-muted">/complete</code> <code className="text-ghost-muted">/next</code></span>
      </div>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left side: Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor */}
          {localChronicle && (
            <Editor
              ref={editorRef}
              content={content}
              onChange={handleContentChange}
              onWordSelect={handleWordSelect}
              onInlineCommand={handleInlineCommand}
              chronicle={localChronicle}
              isGenerating={isGenerating}
            />
          )}

          {/* Attribution footer */}
          <div className="border-t border-ghost-border px-6 py-3">
            <div className="flex items-center gap-4">
              <span className="text-xs text-ghost-muted uppercase tracking-wide flex-shrink-0">
                Attribution
              </span>
              <div className="flex-1 max-w-md">
                <AttributionBar
                  attribution={
                    attribution || {
                      songId: "",
                      totalCharacters: 0,
                      contributors: [{
                        id: 'user',
                        type: 'human',
                        name: 'You',
                        color: '#34d399',
                        characters: 0,
                        percentage: 100,
                      }],
                      humanCharacters: 0,
                      maskContributions: [],
                      humanPercentage: 100,
                    }
                  }
                  showLegend={true}
                />
              </div>
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

      {/* Settings modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        bpm={bpm}
        onBpmChange={setBpm}
      />
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
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
