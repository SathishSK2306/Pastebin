/**
 * POST /api/pastes
 * Create a new paste with optional TTL and view count constraints
 */

import { nanoid } from 'nanoid';
import {
  createPaste,
  validatePasteRequest,
  PasteData,
  PasteResponse,
} from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request
    const validation = validatePasteRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Create paste with unique ID
    const id = nanoid(12);
    const pasteData: PasteData = {
      content: body.content,
      ttl_seconds: body.ttl_seconds,
      max_views: body.max_views,
    };

    await createPaste(id, pasteData);

    const response: PasteResponse = {
      id,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/p/${id}`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating paste:', error);
    return NextResponse.json(
      { error: 'Failed to create paste' },
      { status: 500 }
    );
  }
}
