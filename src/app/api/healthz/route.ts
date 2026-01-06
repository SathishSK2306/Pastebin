import { NextResponse } from 'next/server';
import Redis from 'ioredis';

export async function GET() {
  try {
    // Create a temporary connection just for the ping
    const redis = new Redis(process.env.REDIS_URL || '');
    
    // Attempt a simple database operation to verify connectivity
    await redis.ping();
    
    // Close connection so we don't leak it
    redis.quit();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}