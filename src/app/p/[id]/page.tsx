/**
 * GET /p/:id
 * View a paste as HTML page
 * Server-side rendered paste viewer with XSS protection
 */

import { getPaste } from '@/lib/db';
import { notFound } from 'next/navigation';

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export default async function PastePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const paste = await getPaste(id);

    if (!paste || !paste.available) {
      notFound();
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Paste - ${escapeHtml(paste.content.substring(0, 50))}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      min-height: 100vh; 
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container { 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 10px 40px rgba(0,0,0,0.2); 
      max-width: 900px; 
      width: 100%;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 { font-size: 1.5rem; font-weight: 600; }
    .header p { font-size: 0.9rem; opacity: 0.9; margin-top: 0.25rem; }
    .content-wrapper {
      padding: 2rem;
    }
    .content {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      font-family: "Monaco", "Courier New", monospace;
      font-size: 0.95rem;
      line-height: 1.6;
      overflow-x: auto;
      color: #333;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .actions {
      margin-top: 1.5rem;
      display: flex;
      gap: 0.75rem;
    }
    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-copy {
      background: #667eea;
      color: white;
    }
    .btn-copy:hover {
      background: #5568d3;
    }
    .btn-home {
      background: #e9ecef;
      color: #333;
    }
    .btn-home:hover {
      background: #dee2e6;
    }
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #28a745;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: none;
    }
    .home-link {
      color: white;
      text-decoration: none;
      opacity: 0.9;
      cursor: pointer;
    }
    .home-link:hover {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>Paste</h1>
        <p>Read-only view</p>
      </div>
      <a href="/" class="home-link">← Home</a>
    </div>
    <div class="content-wrapper">
      <div class="content">${escapeHtml(paste.content)}</div>
      <div class="actions">
        <button class="btn-copy" onclick="copyToClipboard()">📋 Copy to Clipboard</button>
        <button class="btn-home" onclick="window.location.href = '/'">🏠 Back to Home</button>
      </div>
    </div>
  </div>
  <footer style="padding:16px; text-align:center; font-size:0.9rem; color:#666;">
    Pastebin Lite • Built with Next.js • Data persisted with Vercel KV — Author: sathish
  </footer>
  <div class="toast" id="toast">Copied to clipboard!</div>
  <script>
    function copyToClipboard() {
      const content = ${JSON.stringify(paste.content)};
      navigator.clipboard.writeText(content).then(() => {
        const toast = document.getElementById('toast');
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2000);
      });
    }
  </script>
</body>
</html>`;

    return (
      <html suppressHydrationWarning>
        <body dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </html>
    );
  } catch (error) {
    console.error('Error fetching paste:', error);
    notFound();
  }
}
