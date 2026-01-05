/**
 * Database utility for Vercel KV persistence layer
 * Handles all paste storage and retrieval operations
 */

import { kv } from '@vercel/kv';

// Local in-memory fallback for development when Vercel KV is not configured
// Persist the fallback store on globalThis so it survives module reloads
// (helps during Fast Refresh / dev server restarts).
const globalAny: any = globalThis as any;
const localStore: Map<string, string> =
  globalAny.__pastebin_local_store ?? (globalAny.__pastebin_local_store = new Map());

const isProductionKVUnavailable = async () => {
  try {
    await kv.get('__kv_probe__');
    return false;
  } catch (e) {
    return true;
  }
};

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

export interface PasteResponse {
  id: string;
  url: string;
}

export interface GetPasteResponse {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}

/**
 * Get current time in milliseconds
 * Respects TEST_MODE with x-test-now-ms header
 */
export function getCurrentTime(testNowMs?: number): number {
  if (process.env.TEST_MODE === '1' && testNowMs) {
    return testNowMs;
  }
  return Date.now();
}

/**
 * Store a new paste in the database
 */
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

  // Store with TTL if present, otherwise store indefinitely
  try {
    if (data.ttl_seconds) {
      await kv.setex(`paste:${id}`, data.ttl_seconds, JSON.stringify(paste));
    } else {
      await kv.set(`paste:${id}`, JSON.stringify(paste));
    }
  } catch (err) {
    // If KV is not available (local dev), fallback to in-memory store
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[db] Vercel KV unavailable — using in-memory fallback for paste', id);
      if (data.ttl_seconds) {
        // Store JSON along with expires_at; no auto-expiry here
        localStore.set(`paste:${id}`, JSON.stringify(paste));
      } else {
        localStore.set(`paste:${id}`, JSON.stringify(paste));
      }
    } else {
      throw err;
    }
  }

  return paste;
}

/**
 * Retrieve a paste by ID
 * Handles view counting and constraint checking
 */
export async function getPaste(
  id: string,
  testNowMs?: number
): Promise<(Paste & { available: boolean }) | null> {
  let data: string | null = null;
  try {
    data = await kv.get<string>(`paste:${id}`);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[db] Vercel KV get failed — reading from in-memory fallback for', id);
      data = localStore.get(`paste:${id}`) ?? null;
    } else {
      throw err;
    }
  }

  if (!data) {
    return null;
  }

  const paste: Paste = JSON.parse(data);
  const now = getCurrentTime(testNowMs);

  // Check if expired
  if (paste.expires_at && now > paste.expires_at) {
    return { ...paste, available: false };
  }

  // Check if view limit exceeded
  if (paste.max_views && paste.views_count >= paste.max_views) {
    return { ...paste, available: false };
  }

  return { ...paste, available: true };
}

/**
 * Increment view count for a paste
 */
export async function incrementViewCount(id: string): Promise<void> {
  try {
    const data = await kv.get<string>(`paste:${id}`);
    if (!data) return;
    const paste: Paste = JSON.parse(data);
    paste.views_count += 1;

    // Recalculate TTL if it has one
    if (paste.ttl_seconds && paste.created_at) {
      const elapsed = Date.now() - paste.created_at;
      const remaining = Math.max(1, paste.ttl_seconds - Math.floor(elapsed / 1000));
      await kv.setex(`paste:${id}`, remaining, JSON.stringify(paste));
    } else {
      await kv.set(`paste:${id}`, JSON.stringify(paste));
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[db] Vercel KV increment failed — updating in-memory fallback for', id);
      const data = localStore.get(`paste:${id}`);
      if (!data) return;
      const paste: Paste = JSON.parse(data);
      paste.views_count += 1;
      localStore.set(`paste:${id}`, JSON.stringify(paste));
    } else {
      throw err;
    }
  }
}

/**
 * Validate paste creation request
 */
export function validatePasteRequest(body: any): {
  valid: boolean;
  error?: string;
} {
  // Check content
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

  // Check ttl_seconds
  if (body.ttl_seconds !== undefined) {
    if (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
      return {
        valid: false,
        error: 'ttl_seconds must be an integer ≥ 1',
      };
    }
  }

  // Check max_views
  if (body.max_views !== undefined) {
    if (!Number.isInteger(body.max_views) || body.max_views < 1) {
      return {
        valid: false,
        error: 'max_views must be an integer ≥ 1',
      };
    }
  }

  return { valid: true };
}
