# Pastebin Lite

A modern, minimal pastebin application built with **Next.js 16** and deployed on **Vercel**. Users can create, share, and view text pastes with optional time-based expiry (TTL) and view-count limits.

## 🎯 Project Overview

**Pastebin Lite** is a take-home assignment submission that demonstrates professional full-stack development practices.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Vercel account (for deployment)

### Local Development

First, run the development server:

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📋 API Documentation

### Health Check
**Endpoint**: `GET /api/healthz`

Response: `{ "ok": true }`

### Create a Paste
**Endpoint**: `POST /api/pastes`

Request:
```json
{
  "content": "Your text here",
  "ttl_seconds": 3600,
  "max_views": 5
}
```

Response: `{ "id": "abc123", "url": "https://your-app.vercel.app/p/abc123" }`

### Fetch Paste (API)
**Endpoint**: `GET /api/pastes/:id`

Response:
```json
{
  "content": "Your text here",
  "remaining_views": 4,
  "expires_at": "2026-01-05T10:30:00.000Z"
}
```

### View Paste (HTML)
**Endpoint**: `GET /p/:id`

Returns HTML page with paste content.

## 🔐 Security Features

✅ XSS Protection - All content HTML-escaped  
✅ No Hardcoded URLs - Uses environment variables  
✅ No Secrets in Repository - KV managed by Vercel  
✅ Serverless-Safe - No global mutable state  
✅ Input Validation - All inputs server-validated

## 📊 Persistence Layer: Vercel KV

**Why Vercel KV?**
- Persistent storage across serverless invocations
- Zero configuration on Vercel
- Automatic key expiry (TTL support)
- Sub-millisecond latency
- Included with Vercel deployments

Data is stored as JSON with automatic expiry:
```typescript
Key: paste:<id>
Value: { id, content, ttl_seconds?, max_views?, created_at, views_count, expires_at? }
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/api/healthz

# Create paste
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello World","ttl_seconds":60}'

# Test mode with deterministic time
TEST_MODE=1 npm run dev
curl http://localhost:3000/api/pastes/<id> -H "x-test-now-ms: 1704470400000"
```

## 📦 Deployment to Vercel

1. Push to GitHub
2. Visit vercel.com and import repository
3. Vercel auto-configures KV database
4. Deploy with automatic builds on push

## ✅ Compliance

- [x] TypeScript with full type safety
- [x] All required API routes implemented
- [x] TTL and view count constraints
- [x] Test mode support with x-test-now-ms header
- [x] XSS protection with HTML escaping
- [x] No global mutable state
- [x] No secrets in repository
- [x] Professional code structure
- [x] Comprehensive documentation

## 🎓 Design Decisions

1. **Vercel KV** - Zero-config, automatic TTL support, perfect for serverless
2. **Nanoid IDs** - URL-safe, collision-resistant, simple
3. **HTML Response** - Faster than JSON + client rendering
4. **View Count on API** - Matches standard pastebin behavior
5. **Test Mode Header** - Deterministic testing without code changes

---

Built with ❤️ using Next.js 16 + Vercel KV | Ready for Vercel deployment
