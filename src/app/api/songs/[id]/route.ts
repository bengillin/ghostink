/**
 * Single Song API
 *
 * GET /api/songs/[id] - Get song with events
 * PUT /api/songs/[id] - Update song
 * DELETE /api/songs/[id] - Delete song
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSong,
  updateSongTitle,
  deleteSong,
  getEditEvents,
  saveEditEvent,
  saveSnapshot,
  getLatestSnapshot,
} from '@/lib/db';
import type { EditEvent } from '@/lib/chronicle/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const song = getSong(id);

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Get events and latest snapshot
    const events = getEditEvents(id);
    const snapshot = getLatestSnapshot(id);

    return NextResponse.json({
      song,
      events,
      snapshot,
    });
  } catch (error) {
    console.error('Error getting song:', error);
    return NextResponse.json(
      { error: 'Failed to get song' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, events, snapshot } = body;

    const song = getSong(id);
    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Update title if provided
    if (title) {
      updateSongTitle(id, title);
    }

    // Save new events if provided
    if (events && Array.isArray(events)) {
      for (const event of events as EditEvent[]) {
        saveEditEvent(event);
      }
    }

    // Save snapshot if provided
    if (snapshot && Array.isArray(snapshot.content)) {
      saveSnapshot(id, snapshot.version, snapshot.content);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating song:', error);
    return NextResponse.json(
      { error: 'Failed to update song' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const song = getSong(id);

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    deleteSong(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { error: 'Failed to delete song' },
      { status: 500 }
    );
  }
}
