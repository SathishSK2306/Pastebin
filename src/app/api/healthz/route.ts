/**
 * GET /api/healthz
 * Health check endpoint
 * Verifies application and database connectivity
 */

import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Attempt a simple database operation to verify connectivity
    await kv.ping();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
