"use client";

import { useEffect, useCallback } from "react";
import { useSongStore } from "@/lib/store";

interface ToolbarProps {
  songId: string | null;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSidebar: () => void;
}

export function Toolbar({ songId, onUndo, onRedo, onOpenSidebar }: ToolbarProps) {
  const { canUndo, canRedo, saveSong, isSaving, lastSaved } = useSongStore();

  const hasUndo = songId ? canUndo(songId) : false;
  const hasRedo = songId ? canRedo(songId) : false;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        if (hasUndo) onUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        if (hasRedo) onRedo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (songId) saveSong(songId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasUndo, hasRedo, onUndo, onRedo, songId, saveSong]);

  const handleSave = useCallback(() => {
    if (songId) saveSong(songId);
  }, [songId, saveSong]);

  return (
    <div className="flex items-center gap-2">
      {/* Sidebar toggle */}
      <button
        onClick={onOpenSidebar}
        className="p-2 hover:bg-ghost-surface rounded transition-colors"
        title="Songs (Cmd+O)"
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-ghost-border" />

      {/* Undo/Redo */}
      <button
        onClick={onUndo}
        disabled={!hasUndo}
        className={`p-2 rounded transition-colors ${
          hasUndo
            ? "hover:bg-ghost-surface text-ghost-text"
            : "text-ghost-muted/50 cursor-not-allowed"
        }`}
        title="Undo (Cmd+Z)"
      >
        <UndoIcon className="w-4 h-4" />
      </button>

      <button
        onClick={onRedo}
        disabled={!hasRedo}
        className={`p-2 rounded transition-colors ${
          hasRedo
            ? "hover:bg-ghost-surface text-ghost-text"
            : "text-ghost-muted/50 cursor-not-allowed"
        }`}
        title="Redo (Cmd+Shift+Z)"
      >
        <RedoIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-ghost-border" />

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!songId || isSaving}
        className={`p-2 rounded transition-colors ${
          songId && !isSaving
            ? "hover:bg-ghost-surface text-ghost-text"
            : "text-ghost-muted/50 cursor-not-allowed"
        }`}
        title="Save (Cmd+S)"
      >
        {isSaving ? (
          <LoadingSpinner className="w-4 h-4" />
        ) : (
          <SaveIcon className="w-4 h-4" />
        )}
      </button>

      {/* Save status */}
      {lastSaved && (
        <span className="text-xs text-ghost-muted">
          Saved {formatTimeSince(lastSaved)}
        </span>
      )}
    </div>
  );
}

function formatTimeSince(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 5000) return "just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

function UndoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function RedoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
