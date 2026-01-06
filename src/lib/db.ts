import Redis from 'ioredis';

// Initialize Redis with the URL from your Vercel Environment Variables
const redis = new Redis(process.env.REDIS_URL || '');

// --- INTERFACES (These are the ones you were missing) ---

export interface Paste {
  id: string;
  content: string;
  ttl_seconds?: number;
  max_views?: number;
  created_at: number;
  views_count: number;
  expires_at?: number;
}

export interface PasteData {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
}

// EXPORTED: Used in POST /api/pastes
export interface PasteResponse {
  id: string;
  url: string;
}

// EXPORTED: Used in GET /api/pastes/:id
export interface GetPasteResponse {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}

// --- HELPER FUNCTIONS ---

export function getCurrentTime(testNowMs?: number): number {
  if (process.env.TEST_MODE === '1' && testNowMs) {
    return testNowMs;
  }
  return Date.now();
}

export async function createPaste(
  id: string,
  data: PasteData
): Promise<Paste> {
  const now = Date.now();
  const expires_at = data.ttl_seconds
    ? now + data.ttl_seconds * 1000
    : undefined;

  const paste: Paste = {
    id,
    content: data.content,
    ttl_seconds: data.ttl_seconds,
    max_views: data.max_views,
    created_at: now,
    views_count: 0,
    expires_at,
  };

  const pasteString = JSON.stringify(paste);

  if (data.ttl_seconds) {
    await redis.set(`paste:${id}`, pasteString, 'EX', data.ttl_seconds);
  } else {
    await redis.set(`paste:${id}`, pasteString);
  }

  return paste;
}

export async function getPaste(
  id: string,
  testNowMs?: number
): Promise<(Paste & { available: boolean }) | null> {
  const data = await redis.get(`paste:${id}`);

  if (!data) {
    return null;
  }

  const paste: Paste = JSON.parse(data);
  const now = getCurrentTime(testNowMs);

  // Check Expiry
  if (paste.expires_at && now > paste.expires_at) {
    return { ...paste, available: false };
  }

  // Check View Limit
  if (paste.max_views && paste.views_count >= paste.max_views) {
    return { ...paste, available: false };
  }

  return { ...paste, available: true };
}

export async function incrementViewCount(id: string): Promise<void> {
  const data = await redis.get(`paste:${id}`);
  if (!data) return;

  const paste: Paste = JSON.parse(data);
  paste.views_count += 1;

  // We need to re-save to update the view count
  // We must calculate remaining TTL so we don't reset the timer
  const pasteString = JSON.stringify(paste);

  if (paste.ttl_seconds && paste.created_at) {
    const elapsed = Date.now() - paste.created_at;
    const remaining = Math.max(1, paste.ttl_seconds - Math.floor(elapsed / 1000));
    await redis.set(`paste:${id}`, pasteString, 'EX', remaining);
  } else {
    await redis.set(`paste:${id}`, pasteString);
  }
}

export function validatePasteRequest(body: any): {
  valid: boolean;
  error?: string;
} {
  if (!body.content || typeof body.content !== 'string') {
    return {
      valid: false,
      error: 'content is required and must be a non-empty string',
    };
  }

  if (body.content.trim().length === 0) {
    return {
      valid: false,
      error: 'content cannot be empty',
    };
  }

  if (body.ttl_seconds !== undefined) {
    const ttl = Number(body.ttl_seconds);
    if (!Number.isInteger(ttl) || ttl < 1) {
      return {
        valid: false,
        error: 'ttl_seconds must be an integer ≥ 1',
      };
    }
  }

  if (body.max_views !== undefined) {
    const views = Number(body.max_views);
    if (!Number.isInteger(views) || views < 1) {
      return {
        valid: false,
        error: 'max_views must be an integer ≥ 1',
      };
    }
  }

  return { valid: true };
}