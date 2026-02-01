"use client";

import { useState } from "react";
import { useSongStore, type Song } from "@/lib/store";

interface SongSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SongSidebar({ isOpen, onClose }: SongSidebarProps) {
  const {
    songs,
    currentSongId,
    isLoading,
    createSong,
    loadSong,
    deleteSong,
    updateTitle,
  } = useSongStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleCreate = () => {
    createSong("Untitled");
    // Song will be loaded automatically when created
  };

  const handleSelect = (id: string) => {
    loadSong(id);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this song? This cannot be undone.")) {
      await deleteSong(id);
    }
  };

  const handleStartEdit = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(song.id);
    setEditTitle(song.title);
  };

  const handleSaveTitle = (id: string) => {
    if (editTitle.trim()) {
      updateTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const songList = Array.from(songs.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="relative w-72 bg-ghost-surface border-r border-ghost-border flex flex-col animate-slide-in-left">
        {/* Header */}
        <div className="p-4 border-b border-ghost-border flex items-center justify-between">
          <h2 className="font-semibold">Songs</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-ghost-border rounded"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* New song button */}
        <div className="p-3 border-b border-ghost-border">
          <button
            onClick={handleCreate}
            className="w-full py-2 px-3 bg-ghost-accent hover:bg-ghost-accent/80 rounded text-sm font-medium flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Song
          </button>
        </div>

        {/* Song list */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-ghost-muted">
              Loading...
            </div>
          ) : songList.length === 0 ? (
            <div className="p-4 text-center text-ghost-muted text-sm">
              No songs yet. Create one to get started.
            </div>
          ) : (
            <ul className="p-2 space-y-1">
              {songList.map((song) => (
                <li
                  key={song.id}
                  onClick={() => handleSelect(song.id)}
                  className={`group p-3 rounded cursor-pointer transition-colors ${
                    currentSongId === song.id
                      ? "bg-ghost-accent/20 border border-ghost-accent/50"
                      : "hover:bg-ghost-border/50"
                  }`}
                >
                  {editingId === song.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveTitle(song.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle(song.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="w-full bg-ghost-bg border border-ghost-border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{song.title}</div>
                        <div className="text-xs text-ghost-muted mt-1">
                          {song.content.filter(l => l.trim()).length} lines
                          <span className="mx-1">·</span>
                          {formatDate(song.updatedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleStartEdit(song, e)}
                          className="p-1 hover:bg-ghost-border rounded"
                          title="Rename"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(song.id, e)}
                          className="p-1 hover:bg-red-500/20 text-ghost-muted hover:text-red-400 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-ghost-border text-xs text-ghost-muted text-center">
          {songList.length} song{songList.length !== 1 ? "s" : ""}
        </div>
      </aside>

      <style jsx>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

  return date.toLocaleDateString();
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
