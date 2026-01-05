# Development Commands

Quick reference for all npm scripts and useful commands.

## 🚀 Core Commands

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev
# -> Open http://localhost:3000

# Production build
npm run build

# Run production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🧪 Testing

```bash
# Health check endpoint
curl http://localhost:3000/api/healthz

# Create a paste
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello World"}'

# Create paste with constraints
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Secret","ttl_seconds":3600,"max_views":5}'

# Fetch paste by ID
curl http://localhost:3000/api/pastes/YOUR_PASTE_ID

# View paste HTML
curl http://localhost:3000/p/YOUR_PASTE_ID
```

## 🧪 Test Mode

Enable deterministic time for testing:

```bash
# Start in test mode
TEST_MODE=1 npm run dev

# Use deterministic time header
curl http://localhost:3000/api/pastes/YOUR_PASTE_ID \
  -H "x-test-now-ms: 1704470400000"
```

## 📦 Deployment

```bash
# Push to GitHub
git add .
git commit -m "Initial implementation"
git push origin main

# Deploy to Vercel
# 1. Visit vercel.com
# 2. Click "New Project"
# 3. Import your GitHub repository
# 4. Select "Next.js" framework
# 5. Deploy (automatic)
```

## 📊 Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── p/            # Dynamic paste viewer
│   │   ├── page.tsx      # Home page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Tailwind styles
│   └── lib/
│       └── db.ts         # Database utilities
├── public/               # Static assets
├── README.md             # Documentation
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── vercel.json          # Vercel config
```

## 🔑 Environment Variables

Create `.env.local`:

```env
# Optional: Set your deployed domain
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app

# Vercel KV (auto-configured on Vercel)
# KV_REST_API_URL=...
# KV_REST_API_TOKEN=...

# For testing
TEST_MODE=0
```

## 📝 Git Workflow

```bash
# Clone repository
git clone <repo-url>
cd pastebin-lite

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/name

# Make changes
# ...

# Test locally
npm run dev
npm run type-check
npm run lint

# Commit changes
git add .
git commit -m "Add feature description"

# Push to GitHub
git push origin feature/name

# Create pull request on GitHub
```

## 🐛 Debugging

```bash
# Check for errors
npm run type-check

# Run linter
npm run lint

# Build with verbose output
npm run build

# Check KV connectivity
curl http://localhost:3000/api/healthz
```

## 📊 Useful Tools

- **TypeScript**: Type safety throughout codebase
- **Tailwind CSS**: Utility-first styling
- **Next.js**: Full-stack framework
- **Vercel KV**: Redis for data persistence
- **nanoid**: Unique ID generation

## 🚨 Common Issues

### Build fails with "Could not find module"
```bash
# Clear dependencies and reinstall
rm -r node_modules
npm install
npm run build
```

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

### KV connection fails locally
```bash
# This is expected. KV only works in production or with proper env vars
# For testing, mock responses or deploy to Vercel
```

---

All set! Start with `npm run dev` to begin development.
