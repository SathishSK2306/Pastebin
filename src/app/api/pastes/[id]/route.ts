/**
 * GET /api/pastes/:id
 * Fetch a paste by ID with metadata
 * Handles view counting and constraint validation
 */

import { getPaste, incrementViewCount, getCurrentTime, GetPasteResponse } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Get test time from header if in test mode
    let testNowMs: number | undefined;
    if (process.env.TEST_MODE === '1') {
      const testNowHeader = request.headers.get('x-test-now-ms');
      if (testNowHeader) {
        testNowMs = parseInt(testNowHeader, 10);
      }
    }

    const paste = await getPaste(id, testNowMs);

    if (!paste || !paste.available) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 });
    }

    // Increment view count
    await incrementViewCount(id);

    // Calculate remaining views
    const remaining_views = paste.max_views
      ? paste.max_views - paste.views_count - 1
      : null;

    // Ensure no negative remaining views
    if (remaining_views !== null && remaining_views < 0) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 });
    }

    const response: GetPasteResponse = {
      content: paste.content,
      remaining_views,
      expires_at: paste.expires_at
        ? new Date(paste.expires_at).toISOString()
        : null,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching paste:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paste' },
      { status: 500 }
    );
  }
}
