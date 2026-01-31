/**
 * GhostInk Song Store
 *
 * Zustand store for song state management with persistence.
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Chronicle } from '../chronicle';
import type { EditEvent, Attribution } from '../chronicle/types';

export interface Song {
  id: string;
  title: string;
  content: string[];
  createdAt: number;
  updatedAt: number;
}

interface SongState {
  // Current song
  currentSongId: string | null;
  songs: Map<string, Song>;
  chronicles: Map<string, Chronicle>;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: number | null;

  // Actions
  createSong: (title?: string) => string;
  loadSong: (id: string) => void;
  saveSong: (id: string) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  updateContent: (id: string, content: string[]) => void;
  updateTitle: (id: string, title: string) => void;

  // Chronicle actions
  getChronicle: (id: string) => Chronicle | undefined;
  undo: (id: string) => string[] | null;
  redo: (id: string) => string[] | null;
  canUndo: (id: string) => boolean;
  canRedo: (id: string) => boolean;

  // Persistence
  fetchSongs: () => Promise<void>;

  // Getters
  getCurrentSong: () => Song | undefined;
  getAttribution: (id: string) => Attribution | undefined;
}

// Undo/redo stacks per song
const undoStacks = new Map<string, string[][]>();
const redoStacks = new Map<string, string[][]>();
const MAX_UNDO = 100;

export const useSongStore = create<SongState>((set, get) => ({
  currentSongId: null,
  songs: new Map(),
  chronicles: new Map(),
  isLoading: false,
  isSaving: false,
  lastSaved: null,

  createSong: (title = 'Untitled') => {
    const id = nanoid();
    const now = Date.now();
    const song: Song = {
      id,
      title,
      content: [''],
      createdAt: now,
      updatedAt: now,
    };

    const chronicle = new Chronicle(id, 'user-1', ['']);

    set((state) => {
      const newSongs = new Map(state.songs);
      newSongs.set(id, song);
      const newChronicles = new Map(state.chronicles);
      newChronicles.set(id, chronicle);
      return {
        songs: newSongs,
        chronicles: newChronicles,
        currentSongId: id,
      };
    });

    // Initialize undo stack
    undoStacks.set(id, []);
    redoStacks.set(id, []);

    // Save to backend
    get().saveSong(id);

    return id;
  },

  loadSong: (id: string) => {
    set({ currentSongId: id });
  },

  saveSong: async (id: string) => {
    const song = get().songs.get(id);
    const chronicle = get().chronicles.get(id);
    if (!song) return;

    set({ isSaving: true });

    try {
      const response = await fetch(`/api/songs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: song.title,
          snapshot: {
            version: chronicle?.getVersion() || 0,
            content: song.content,
          },
        }),
      });

      if (response.ok) {
        set({ lastSaved: Date.now() });
      }
    } catch (error) {
      console.error('Failed to save song:', error);
    } finally {
      set({ isSaving: false });
    }
  },

  deleteSong: async (id: string) => {
    try {
      await fetch(`/api/songs/${id}`, { method: 'DELETE' });

      set((state) => {
        const newSongs = new Map(state.songs);
        newSongs.delete(id);
        const newChronicles = new Map(state.chronicles);
        newChronicles.delete(id);

        // If deleting current song, switch to another or null
        let newCurrentId = state.currentSongId;
        if (state.currentSongId === id) {
          const remaining = Array.from(newSongs.keys());
          newCurrentId = remaining.length > 0 ? remaining[0] : null;
        }

        return {
          songs: newSongs,
          chronicles: newChronicles,
          currentSongId: newCurrentId,
        };
      });

      undoStacks.delete(id);
      redoStacks.delete(id);
    } catch (error) {
      console.error('Failed to delete song:', error);
    }
  },

  updateContent: (id: string, content: string[]) => {
    const song = get().songs.get(id);
    if (!song) return;

    // Save current state to undo stack
    const undoStack = undoStacks.get(id) || [];
    undoStack.push([...song.content]);
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    undoStacks.set(id, undoStack);

    // Clear redo stack on new edit
    redoStacks.set(id, []);

    set((state) => {
      const newSongs = new Map(state.songs);
      newSongs.set(id, {
        ...song,
        content,
        updatedAt: Date.now(),
      });
      return { songs: newSongs };
    });
  },

  updateTitle: (id: string, title: string) => {
    const song = get().songs.get(id);
    if (!song) return;

    set((state) => {
      const newSongs = new Map(state.songs);
      newSongs.set(id, {
        ...song,
        title,
        updatedAt: Date.now(),
      });
      return { songs: newSongs };
    });
  },

  getChronicle: (id: string) => {
    return get().chronicles.get(id);
  },

  undo: (id: string) => {
    const undoStack = undoStacks.get(id);
    const song = get().songs.get(id);
    if (!undoStack || undoStack.length === 0 || !song) return null;

    // Pop from undo, push current to redo
    const previousContent = undoStack.pop()!;
    const redoStack = redoStacks.get(id) || [];
    redoStack.push([...song.content]);
    redoStacks.set(id, redoStack);
    undoStacks.set(id, undoStack);

    // Update song content
    set((state) => {
      const newSongs = new Map(state.songs);
      newSongs.set(id, {
        ...song,
        content: previousContent,
        updatedAt: Date.now(),
      });
      return { songs: newSongs };
    });

    return previousContent;
  },

  redo: (id: string) => {
    const redoStack = redoStacks.get(id);
    const song = get().songs.get(id);
    if (!redoStack || redoStack.length === 0 || !song) return null;

    // Pop from redo, push current to undo
    const nextContent = redoStack.pop()!;
    const undoStack = undoStacks.get(id) || [];
    undoStack.push([...song.content]);
    undoStacks.set(id, undoStack);
    redoStacks.set(id, redoStack);

    // Update song content
    set((state) => {
      const newSongs = new Map(state.songs);
      newSongs.set(id, {
        ...song,
        content: nextContent,
        updatedAt: Date.now(),
      });
      return { songs: newSongs };
    });

    return nextContent;
  },

  canUndo: (id: string) => {
    const stack = undoStacks.get(id);
    return !!stack && stack.length > 0;
  },

  canRedo: (id: string) => {
    const stack = redoStacks.get(id);
    return !!stack && stack.length > 0;
  },

  fetchSongs: async () => {
    set({ isLoading: true });

    try {
      const response = await fetch('/api/songs');
      const data = await response.json();

      if (data.songs && Array.isArray(data.songs)) {
        const newSongs = new Map<string, Song>();
        const newChronicles = new Map<string, Chronicle>();

        for (const dbSong of data.songs) {
          // Fetch full song with content
          const songResponse = await fetch(`/api/songs/${dbSong.id}`);
          const songData = await songResponse.json();

          const content = songData.snapshot?.content || [''];

          newSongs.set(dbSong.id, {
            id: dbSong.id,
            title: dbSong.title,
            content,
            createdAt: dbSong.created_at,
            updatedAt: dbSong.updated_at,
          });

          newChronicles.set(dbSong.id, new Chronicle(dbSong.id, 'user-1', content));
          undoStacks.set(dbSong.id, []);
          redoStacks.set(dbSong.id, []);
        }

        set({
          songs: newSongs,
          chronicles: newChronicles,
          currentSongId: newSongs.size > 0 ? Array.from(newSongs.keys())[0] : null,
        });
      }
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  getCurrentSong: () => {
    const { currentSongId, songs } = get();
    return currentSongId ? songs.get(currentSongId) : undefined;
  },

  getAttribution: (id: string) => {
    const chronicle = get().chronicles.get(id);
    return chronicle?.getAttribution();
  },
}));
