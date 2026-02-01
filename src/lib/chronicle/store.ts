/**
 * GhostInk Chronicle Store
 *
 * Event sourcing store that tracks all edits and reconstructs document state.
 */

import { nanoid } from 'nanoid';
import type {
  EditEvent,
  InsertEvent,
  DeleteEvent,
  ReplaceEvent,
  DocumentState,
  Position,
  Range,
  Author,
  Attribution,
  Contributor,
} from './types';
import { MASK_REGISTRY } from '@/lib/masks/types';

/**
 * Apply an event to document lines
 */
function applyEvent(lines: string[], event: EditEvent): string[] {
  const result = [...lines];

  switch (event.type) {
    case 'insert': {
      const { position, content } = event;
      // Ensure line exists
      while (result.length <= position.line) {
        result.push('');
      }
      const line = result[position.line];
      result[position.line] =
        line.slice(0, position.character) +
        content +
        line.slice(position.character);

      // Handle newlines in inserted content
      if (content.includes('\n')) {
        const parts = result[position.line].split('\n');
        result.splice(position.line, 1, ...parts);
      }
      break;
    }

    case 'delete': {
      const { range } = event;
      if (range.start.line === range.end.line) {
        // Single line deletion
        const line = result[range.start.line] || '';
        result[range.start.line] =
          line.slice(0, range.start.character) +
          line.slice(range.end.character);
      } else {
        // Multi-line deletion
        const startLine = result[range.start.line] || '';
        const endLine = result[range.end.line] || '';
        result[range.start.line] =
          startLine.slice(0, range.start.character) +
          endLine.slice(range.end.character);
        result.splice(range.start.line + 1, range.end.line - range.start.line);
      }
      break;
    }

    case 'replace': {
      const { range, newContent } = event;
      // Delete then insert
      const deleteEvent: DeleteEvent = {
        ...event,
        type: 'delete',
        deletedContent: event.oldContent,
      };
      const afterDelete = applyEvent(result, deleteEvent);

      const insertEvent: InsertEvent = {
        ...event,
        type: 'insert',
        position: range.start,
        content: newContent,
      };
      return applyEvent(afterDelete, insertEvent);
    }

    case 'move': {
      const { fromRange, toPosition, content } = event;
      // Delete from original position
      const deleteEvent: DeleteEvent = {
        ...event,
        type: 'delete',
        range: fromRange,
        deletedContent: content,
      };
      const afterDelete = applyEvent(result, deleteEvent);

      // Insert at new position
      const insertEvent: InsertEvent = {
        ...event,
        type: 'insert',
        position: toPosition,
        content,
      };
      return applyEvent(afterDelete, insertEvent);
    }
  }

  return result;
}

/**
 * Chronicle store for a single song
 */
export class Chronicle {
  private events: EditEvent[] = [];
  private state: DocumentState;
  private sessionId: string;
  private userId: string;

  constructor(songId: string, userId: string, initialContent: string[] = ['']) {
    this.state = {
      songId,
      lines: initialContent,
      version: 0,
    };
    this.sessionId = nanoid();
    this.userId = userId;
  }

  /**
   * Get current document content
   */
  getContent(): string[] {
    return [...this.state.lines];
  }

  /**
   * Get content as single string
   */
  getText(): string {
    return this.state.lines.join('\n');
  }

  /**
   * Get current version
   */
  getVersion(): number {
    return this.state.version;
  }

  /**
   * Get all events
   */
  getEvents(): EditEvent[] {
    return [...this.events];
  }

  /**
   * Insert text at position
   */
  insert(
    position: Position,
    content: string,
    author?: Author
  ): InsertEvent {
    const event: InsertEvent = {
      id: nanoid(),
      songId: this.state.songId,
      timestamp: Date.now(),
      author: author || { type: 'human', userId: this.userId },
      sessionId: this.sessionId,
      type: 'insert',
      position,
      content,
    };

    this.applyAndStore(event);
    return event;
  }

  /**
   * Delete text in range
   */
  delete(range: Range): DeleteEvent {
    const deletedContent = this.getTextInRange(range);
    const event: DeleteEvent = {
      id: nanoid(),
      songId: this.state.songId,
      timestamp: Date.now(),
      author: { type: 'human', userId: this.userId },
      sessionId: this.sessionId,
      type: 'delete',
      range,
      deletedContent,
    };

    this.applyAndStore(event);
    return event;
  }

  /**
   * Replace text in range
   */
  replace(
    range: Range,
    newContent: string,
    author?: Author
  ): ReplaceEvent {
    const oldContent = this.getTextInRange(range);
    const event: ReplaceEvent = {
      id: nanoid(),
      songId: this.state.songId,
      timestamp: Date.now(),
      author: author || { type: 'human', userId: this.userId },
      sessionId: this.sessionId,
      type: 'replace',
      range,
      oldContent,
      newContent,
    };

    this.applyAndStore(event);
    return event;
  }

  /**
   * Insert text from a Mask
   */
  insertFromMask(
    position: Position,
    content: string,
    maskId: string,
    confidence: number
  ): InsertEvent {
    return this.insert(position, content, {
      type: 'mask',
      maskId,
      confidence,
    });
  }

  /**
   * Get text in a range
   */
  private getTextInRange(range: Range): string {
    const lines = this.state.lines;
    if (range.start.line === range.end.line) {
      return (lines[range.start.line] || '').slice(
        range.start.character,
        range.end.character
      );
    }

    const result: string[] = [];
    result.push((lines[range.start.line] || '').slice(range.start.character));
    for (let i = range.start.line + 1; i < range.end.line; i++) {
      result.push(lines[i] || '');
    }
    result.push((lines[range.end.line] || '').slice(0, range.end.character));
    return result.join('\n');
  }

  /**
   * Apply event and store it
   */
  private applyAndStore(event: EditEvent): void {
    this.events.push(event);
    this.state.lines = applyEvent(this.state.lines, event);
    this.state.version++;
  }

  /**
   * Reconstruct state at a specific version
   */
  getStateAtVersion(version: number): DocumentState {
    const lines: string[] = [''];
    const eventsToApply = this.events.slice(0, version);

    let currentLines = lines;
    for (const event of eventsToApply) {
      currentLines = applyEvent(currentLines, event);
    }

    return {
      songId: this.state.songId,
      lines: currentLines,
      version,
    };
  }

  /**
   * Calculate attribution statistics
   */
  getAttribution(): Attribution {
    const charCount = {
      humans: new Map<string, number>(), // userId -> characters
      masks: new Map<string, number>(),   // maskId -> characters
    };

    // Track net characters added by each author
    for (const event of this.events) {
      let chars = 0;

      if (event.type === 'insert') {
        chars = event.content.length;
      } else if (event.type === 'replace') {
        chars = event.newContent.length - event.oldContent.length;
      } else if (event.type === 'delete') {
        chars = -event.deletedContent.length;
      }

      if (event.author.type === 'human') {
        const current = charCount.humans.get(event.author.userId) || 0;
        charCount.humans.set(event.author.userId, current + chars);
      } else {
        const current = charCount.masks.get(event.author.maskId) || 0;
        charCount.masks.set(event.author.maskId, current + chars);
      }
    }

    // Build contributors array
    const contributors: Contributor[] = [];

    // Add human contributors
    for (const [userId, chars] of charCount.humans.entries()) {
      const characters = Math.max(0, chars);
      if (characters > 0) {
        contributors.push({
          id: userId,
          type: 'human',
          name: 'You', // In the future, could look up user names
          color: '#34d399', // ghost-human color
          characters,
          percentage: 0, // Will calculate below
        });
      }
    }

    // Add mask contributors
    for (const [maskId, chars] of charCount.masks.entries()) {
      const characters = Math.max(0, chars);
      if (characters > 0) {
        const maskInfo = MASK_REGISTRY[maskId];
        contributors.push({
          id: maskId,
          type: 'mask',
          name: maskInfo?.mask.name || maskId,
          color: maskInfo?.mask.color || '#a78bfa', // fallback to ghost-mask color
          characters,
          percentage: 0, // Will calculate below
        });
      }
    }

    // Calculate totals
    const totalChars = contributors.reduce((sum, c) => sum + c.characters, 0);

    // Calculate percentages
    for (const contributor of contributors) {
      contributor.percentage = totalChars > 0
        ? (contributor.characters / totalChars) * 100
        : 0;
    }

    // Sort: humans first, then masks by contribution size
    contributors.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'human' ? -1 : 1;
      return b.characters - a.characters;
    });

    // Calculate backward-compatible fields
    const humanChars = contributors
      .filter(c => c.type === 'human')
      .reduce((sum, c) => sum + c.characters, 0);
    const humanPercentage = totalChars > 0 ? (humanChars / totalChars) * 100 : 100;

    const maskContributions = contributors
      .filter(c => c.type === 'mask')
      .map(c => ({
        maskId: c.id,
        characters: c.characters,
        percentage: c.percentage,
      }));

    // If no contributors yet, show 100% human
    if (contributors.length === 0) {
      contributors.push({
        id: this.userId,
        type: 'human',
        name: 'You',
        color: '#34d399',
        characters: 0,
        percentage: 100,
      });
    }

    return {
      songId: this.state.songId,
      totalCharacters: totalChars,
      contributors,
      humanCharacters: humanChars,
      humanPercentage,
      maskContributions,
    };
  }

  /**
   * Get events by author type
   */
  getEventsByAuthor(authorType: 'human' | 'mask'): EditEvent[] {
    return this.events.filter((e) => e.author.type === authorType);
  }

  /**
   * Start a new session
   */
  newSession(): void {
    this.sessionId = nanoid();
  }

  /**
   * Export events for persistence
   */
  export(): { events: EditEvent[]; state: DocumentState } {
    return {
      events: this.events,
      state: this.state,
    };
  }

  /**
   * Import events (for loading)
   */
  static import(
    data: { events: EditEvent[]; state: DocumentState },
    userId: string
  ): Chronicle {
    const chronicle = new Chronicle(data.state.songId, userId, ['']);
    chronicle.events = data.events;
    chronicle.state = data.state;
    return chronicle;
  }
}
