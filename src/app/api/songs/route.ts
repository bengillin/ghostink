/**
 * Songs API
 *
 * GET /api/songs - List songs
 * POST /api/songs - Create a new song
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createSong,
  listSongs,
  getOrCreateDefaultUser,
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getOrCreateDefaultUser();
    const songs = listSongs(user.id);

    return NextResponse.json({ songs });
  } catch (error) {
    console.error('Error listing songs:', error);
    return NextResponse.json(
      { error: 'Failed to list songs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, projectId } = body;

    const user = getOrCreateDefaultUser();
    const song = createSong(user.id, title || 'Untitled', projectId);

    return NextResponse.json({ song });
  } catch (error) {
    console.error('Error creating song:', error);
    return NextResponse.json(
      { error: 'Failed to create song' },
      { status: 500 }
    );
  }
}
