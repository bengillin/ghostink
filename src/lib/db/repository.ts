/**
 * GhostInk Database Repository
 *
 * CRUD operations for songs, events, and related data.
 */

import { nanoid } from 'nanoid';
import { getDatabase } from './schema';
import type { EditEvent, Position, Range } from '../chronicle/types';

// Types for database records
export interface DbUser {
  id: string;
  username: string;
  email: string | null;
  created_at: number;
}

export interface DbSong {
  id: string;
  project_id: string | null;
  user_id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

export interface DbProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: number;
  updated_at: number;
}

// ============ Users ============

export function createUser(username: string, email?: string): DbUser {
  const db = getDatabase();
  const id = nanoid();
  const now = Date.now();

  db.prepare(`
    INSERT INTO users (id, username, email, created_at)
    VALUES (?, ?, ?, ?)
  `).run(id, username, email || null, now);

  return { id, username, email: email || null, created_at: now };
}

export function getUser(id: string): DbUser | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined;
}

export function getUserByUsername(username: string): DbUser | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as DbUser | undefined;
}

export function getOrCreateDefaultUser(): DbUser {
  let user = getUserByUsername('default');
  if (!user) {
    user = createUser('default', 'default@ghostink.local');
  }
  return user;
}

// ============ Projects ============

export function createProject(userId: string, title: string, description?: string): DbProject {
  const db = getDatabase();
  const id = nanoid();
  const now = Date.now();

  db.prepare(`
    INSERT INTO projects (id, user_id, title, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, description || null, now, now);

  return { id, user_id: userId, title, description: description || null, created_at: now, updated_at: now };
}

export function getProject(id: string): DbProject | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as DbProject | undefined;
}

export function listProjects(userId: string): DbProject[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC').all(userId) as DbProject[];
}

// ============ Songs ============

export function createSong(userId: string, title: string = 'Untitled', projectId?: string): DbSong {
  const db = getDatabase();
  const id = nanoid();
  const now = Date.now();

  db.prepare(`
    INSERT INTO songs (id, project_id, user_id, title, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, projectId || null, userId, title, now, now);

  return { id, project_id: projectId || null, user_id: userId, title, created_at: now, updated_at: now };
}

export function getSong(id: string): DbSong | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM songs WHERE id = ?').get(id) as DbSong | undefined;
}

export function listSongs(userId: string, projectId?: string): DbSong[] {
  const db = getDatabase();
  if (projectId) {
    return db.prepare('SELECT * FROM songs WHERE user_id = ? AND project_id = ? ORDER BY updated_at DESC')
      .all(userId, projectId) as DbSong[];
  }
  return db.prepare('SELECT * FROM songs WHERE user_id = ? ORDER BY updated_at DESC')
    .all(userId) as DbSong[];
}

export function updateSongTitle(id: string, title: string): void {
  const db = getDatabase();
  db.prepare('UPDATE songs SET title = ?, updated_at = ? WHERE id = ?')
    .run(title, Date.now(), id);
}

export function deleteSong(id: string): void {
  const db = getDatabase();
  // Delete events first (foreign key)
  db.prepare('DELETE FROM edit_events WHERE song_id = ?').run(id);
  db.prepare('DELETE FROM snapshots WHERE song_id = ?').run(id);
  db.prepare('DELETE FROM sessions WHERE song_id = ?').run(id);
  db.prepare('DELETE FROM songs WHERE id = ?').run(id);
}

// ============ Edit Events ============

export function saveEditEvent(event: EditEvent): void {
  const db = getDatabase();

  let positionLine: number | null = null;
  let positionChar: number | null = null;
  let rangeStartLine: number | null = null;
  let rangeStartChar: number | null = null;
  let rangeEndLine: number | null = null;
  let rangeEndChar: number | null = null;
  let content: string | null = null;
  let oldContent: string | null = null;
  let confidence: number | null = null;
  let userId: string | null = null;
  let maskId: string | null = null;

  // Extract author info
  if (event.author.type === 'human') {
    userId = event.author.userId;
  } else {
    maskId = event.author.maskId;
    confidence = event.author.confidence;
  }

  // Extract position/range based on event type
  switch (event.type) {
    case 'insert':
      positionLine = event.position.line;
      positionChar = event.position.character;
      content = event.content;
      break;
    case 'delete':
      rangeStartLine = event.range.start.line;
      rangeStartChar = event.range.start.character;
      rangeEndLine = event.range.end.line;
      rangeEndChar = event.range.end.character;
      oldContent = event.deletedContent;
      break;
    case 'replace':
      rangeStartLine = event.range.start.line;
      rangeStartChar = event.range.start.character;
      rangeEndLine = event.range.end.line;
      rangeEndChar = event.range.end.character;
      oldContent = event.oldContent;
      content = event.newContent;
      break;
    case 'move':
      positionLine = event.toPosition.line;
      positionChar = event.toPosition.character;
      rangeStartLine = event.fromRange.start.line;
      rangeStartChar = event.fromRange.start.character;
      rangeEndLine = event.fromRange.end.line;
      rangeEndChar = event.fromRange.end.character;
      content = event.content;
      break;
  }

  db.prepare(`
    INSERT INTO edit_events (
      id, song_id, user_id, mask_id, event_type,
      position_line, position_char,
      range_start_line, range_start_char, range_end_line, range_end_char,
      content, old_content, confidence, session_id, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    event.id,
    event.songId,
    userId,
    maskId,
    event.type,
    positionLine,
    positionChar,
    rangeStartLine,
    rangeStartChar,
    rangeEndLine,
    rangeEndChar,
    content,
    oldContent,
    confidence,
    event.sessionId,
    event.timestamp
  );

  // Update song's updated_at
  db.prepare('UPDATE songs SET updated_at = ? WHERE id = ?')
    .run(event.timestamp, event.songId);
}

export function getEditEvents(songId: string, limit?: number, offset?: number): EditEvent[] {
  const db = getDatabase();

  let query = 'SELECT * FROM edit_events WHERE song_id = ? ORDER BY timestamp ASC';
  const params: (string | number)[] = [songId];

  if (limit) {
    query += ' LIMIT ?';
    params.push(limit);
    if (offset) {
      query += ' OFFSET ?';
      params.push(offset);
    }
  }

  const rows = db.prepare(query).all(...params) as Array<Record<string, unknown>>;

  return rows.map((row) => rowToEditEvent(row));
}

function rowToEditEvent(row: Record<string, unknown>): EditEvent {
  const author = row.mask_id
    ? { type: 'mask' as const, maskId: row.mask_id as string, confidence: row.confidence as number }
    : { type: 'human' as const, userId: row.user_id as string };

  const base = {
    id: row.id as string,
    songId: row.song_id as string,
    timestamp: row.timestamp as number,
    author,
    sessionId: row.session_id as string,
  };

  switch (row.event_type) {
    case 'insert':
      return {
        ...base,
        type: 'insert',
        position: { line: row.position_line as number, character: row.position_char as number },
        content: row.content as string,
      };
    case 'delete':
      return {
        ...base,
        type: 'delete',
        range: {
          start: { line: row.range_start_line as number, character: row.range_start_char as number },
          end: { line: row.range_end_line as number, character: row.range_end_char as number },
        },
        deletedContent: row.old_content as string,
      };
    case 'replace':
      return {
        ...base,
        type: 'replace',
        range: {
          start: { line: row.range_start_line as number, character: row.range_start_char as number },
          end: { line: row.range_end_line as number, character: row.range_end_char as number },
        },
        oldContent: row.old_content as string,
        newContent: row.content as string,
      };
    case 'move':
      return {
        ...base,
        type: 'move',
        fromRange: {
          start: { line: row.range_start_line as number, character: row.range_start_char as number },
          end: { line: row.range_end_line as number, character: row.range_end_char as number },
        },
        toPosition: { line: row.position_line as number, character: row.position_char as number },
        content: row.content as string,
      };
    default:
      throw new Error(`Unknown event type: ${row.event_type}`);
  }
}

// ============ Snapshots ============

export function saveSnapshot(songId: string, version: number, content: string[]): void {
  const db = getDatabase();
  const id = nanoid();

  db.prepare(`
    INSERT OR REPLACE INTO snapshots (id, song_id, version, content, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, songId, version, JSON.stringify(content), Date.now());
}

export function getLatestSnapshot(songId: string): { version: number; content: string[] } | null {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT version, content FROM snapshots
    WHERE song_id = ?
    ORDER BY version DESC
    LIMIT 1
  `).get(songId) as { version: number; content: string } | undefined;

  if (!row) return null;

  return {
    version: row.version,
    content: JSON.parse(row.content),
  };
}

export function getSnapshotAtVersion(songId: string, version: number): { version: number; content: string[] } | null {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT version, content FROM snapshots
    WHERE song_id = ? AND version <= ?
    ORDER BY version DESC
    LIMIT 1
  `).get(songId, version) as { version: number; content: string } | undefined;

  if (!row) return null;

  return {
    version: row.version,
    content: JSON.parse(row.content),
  };
}
