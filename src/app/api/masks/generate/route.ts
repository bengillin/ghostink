/**
 * Mask Generation API
 *
 * POST /api/masks/generate - Generate lyrics from a Mask
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateFromClaudeMask, isClaudeAvailable } from '@/lib/masks/claude-service';
import { generateFromMask, getAvailableMasks } from '@/lib/masks/service';
import type { MaskRequest } from '@/lib/masks/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MaskRequest;

    const { maskId, mode, context, options } = body;

    if (!maskId || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: maskId, mode' },
        { status: 400 }
      );
    }

    // Use Claude if available, otherwise fall back to mock
    let response;
    if (isClaudeAvailable()) {
      response = await generateFromClaudeMask({
        maskId,
        mode,
        context: context || {},
        options,
      });
    } else {
      // Fall back to mock service
      response = await generateFromMask({
        maskId,
        mode,
        context: context || {},
        options,
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Mask generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return info about available masks and API status
  const masks = getAvailableMasks();
  return NextResponse.json({
    claudeAvailable: isClaudeAvailable(),
    masks: masks.map(m => ({
      id: m.id,
      name: m.name,
      status: m.status,
      color: m.color,
      description: m.description,
    })),
  });
}
