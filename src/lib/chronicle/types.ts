/**
 * GhostInk Chronicle Types
 *
 * Event sourcing types for tracking every edit.
 */

// Who made the edit
export type Author =
  | { type: 'human'; userId: string }
  | { type: 'mask'; maskId: string; confidence: number };

// Types of edit events
export type EditEventType =
  | 'insert'      // Added text
  | 'delete'      // Removed text
  | 'replace'     // Replaced text (delete + insert combined)
  | 'move';       // Moved text from one position to another

// Position in the document
export interface Position {
  line: number;      // 0-indexed line number
  character: number; // 0-indexed character offset in line
}

// Range in the document
export interface Range {
  start: Position;
  end: Position;
}

// Base event structure
interface BaseEvent {
  id: string;
  songId: string;
  timestamp: number;
  author: Author;
  sessionId: string;  // Group events by writing session
}

// Insert event
export interface InsertEvent extends BaseEvent {
  type: 'insert';
  position: Position;
  content: string;
}

// Delete event
export interface DeleteEvent extends BaseEvent {
  type: 'delete';
  range: Range;
  deletedContent: string; // What was deleted (for undo)
}

// Replace event (atomic delete + insert)
export interface ReplaceEvent extends BaseEvent {
  type: 'replace';
  range: Range;
  oldContent: string;
  newContent: string;
}

// Move event
export interface MoveEvent extends BaseEvent {
  type: 'move';
  fromRange: Range;
  toPosition: Position;
  content: string;
}

// Union type for all events
export type EditEvent = InsertEvent | DeleteEvent | ReplaceEvent | MoveEvent;

// Song structure
export interface Song {
  id: string;
  projectId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

// Current document state (computed from events)
export interface DocumentState {
  songId: string;
  lines: string[];
  version: number;  // Number of events applied
}

// Session tracking
export interface Session {
  id: string;
  songId: string;
  userId: string;
  startedAt: number;
  endedAt?: number;
}

// Individual contributor in attribution
export interface Contributor {
  id: string;
  type: 'human' | 'mask';
  name: string;           // Display name
  color: string;          // Color for UI
  characters: number;
  percentage: number;
}

// Attribution statistics
export interface Attribution {
  songId: string;
  totalCharacters: number;
  contributors: Contributor[];
  // Convenience accessors for backward compatibility
  humanCharacters: number;
  humanPercentage: number;
  maskContributions: {
    maskId: string;
    characters: number;
    percentage: number;
  }[];
}

// Snapshot for faster reconstruction
export interface Snapshot {
  songId: string;
  version: number;
  content: string[];
  timestamp: number;
}
