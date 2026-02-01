/**
 * GhostInk Database Schema
 *
 * SQLite database for persisting songs, edit history, and user data.
 */

import Database from 'better-sqlite3';
import { join } from 'path';

let db: Database.Database | null = null;

/**
 * Get or create database connection
 */
export function getDatabase(): Database.Database {
  if (db) return db;

  const dbPath = process.env.GHOSTINK_DB_PATH || join(process.cwd(), 'ghostink.db');
  db = new Database(dbPath);

  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL');

  // Initialize schema
  initializeSchema(db);

  return db;
}

/**
 * Initialize database schema
 */
function initializeSchema(db: Database.Database): void {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    -- Projects (collections of songs)
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    -- Songs
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL DEFAULT 'Untitled',
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    -- Edit events (immutable, append-only)
    CREATE TABLE IF NOT EXISTS edit_events (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL REFERENCES songs(id),
      user_id TEXT REFERENCES users(id),
      mask_id TEXT,
      event_type TEXT NOT NULL CHECK(event_type IN ('insert', 'delete', 'replace', 'move')),
      position_line INTEGER,
      position_char INTEGER,
      range_start_line INTEGER,
      range_start_char INTEGER,
      range_end_line INTEGER,
      range_end_char INTEGER,
      content TEXT,
      old_content TEXT,
      confidence REAL,
      session_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      metadata TEXT -- JSON for additional data
    );

    -- Song snapshots (for faster reconstruction)
    CREATE TABLE IF NOT EXISTS snapshots (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL REFERENCES songs(id),
      version INTEGER NOT NULL,
      content TEXT NOT NULL, -- JSON array of lines
      timestamp INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      UNIQUE(song_id, version)
    );

    -- Sessions (writing sessions)
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL REFERENCES songs(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      started_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      ended_at INTEGER
    );

    -- Masks (AI collaborators)
    CREATE TABLE IF NOT EXISTS masks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      artist_name TEXT NOT NULL,
      description TEXT,
      config TEXT, -- JSON config
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'training', 'deprecated')),
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    -- Indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_songs_user ON songs(user_id);
    CREATE INDEX IF NOT EXISTS idx_songs_project ON songs(project_id);
    CREATE INDEX IF NOT EXISTS idx_events_song ON edit_events(song_id);
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON edit_events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_snapshots_song ON snapshots(song_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_song ON sessions(song_id);
  `);

  // Insert default DOOM mask if not exists
  const doomExists = db.prepare('SELECT id FROM masks WHERE id = ?').get('doom');
  if (!doomExists) {
    db.prepare(`
      INSERT INTO masks (id, name, artist_name, description, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'doom',
      'DOOM',
      'MF DOOM',
      'The supervillain. Complex internals, comic book references, off-beat flow.',
      'active'
    );
  }

  // Insert Kendrick mask if not exists
  const kendrickExists = db.prepare('SELECT id FROM masks WHERE id = ?').get('kendrick');
  if (!kendrickExists) {
    db.prepare(`
      INSERT INTO masks (id, name, artist_name, description, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'kendrick',
      'K.Dot',
      'Kendrick Lamar',
      'The storyteller. Dense internal rhymes, social commentary, Compton roots.',
      'active'
    );
  }
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
