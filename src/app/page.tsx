'use client';

import { useState } from 'react';

interface CreatePasteResponse {
  id: string;
  url: string;
  error?: string;
}

export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const handleCreatePaste = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setShareUrl('');

    try {
      const body: any = {
        content: content.trim(),
      };

      if (ttlSeconds) {
        body.ttl_seconds = parseInt(ttlSeconds, 10);
      }

      if (maxViews) {
        body.max_views = parseInt(maxViews, 10);
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data: CreatePasteResponse = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create paste');
        return;
      }

      setSuccess(`Paste created successfully!`);
      setShareUrl(data.url);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setSuccess('URL copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            📝 Pastebin Lite
          </h1>
          <p className="text-blue-100 text-lg">
            Share your text snippets securely with optional expiry and view limits
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a Paste</h2>

            <form onSubmit={handleCreatePaste} className="space-y-6">
              {/* Content Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paste Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your text here..."
                  className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm text-gray-900 placeholder-gray-400"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Required - Max content length limited by storage</p>
              </div>

              {/* TTL Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ⏰ Expiry Time (seconds)
                </label>
                <input
                  type="number"
                  value={ttlSeconds}
                  onChange={(e) => setTtlSeconds(e.target.value)}
                  placeholder="e.g., 3600 for 1 hour"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Optional - Paste will expire after this time</p>
              </div>

              {/* Max Views Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👁️ Max Views
                </label>
                <input
                  type="number"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Optional - Paste will expire after this many views</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 active:scale-95"
              >
                {loading ? 'Creating...' : '✨ Create Paste'}
              </button>
            </form>
          </div>

          {/* Result Section */}
          <div className="space-y-6">
            {/* Success Message */}
            {success && shareUrl && (
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">✅</span>
                  <h3 className="text-2xl font-bold text-gray-800">Success!</h3>
                </div>
                <p className="text-gray-600 mb-4">{success}</p>

                {/* URL Display */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-600 font-semibold mb-2">Share Link:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm break-all text-blue-600 font-mono">
                      {shareUrl}
                    </code>
                    <button
                      onClick={copyUrlToClipboard}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition whitespace-nowrap"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>

                {/* Features Info */}
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-2">✨ Features:</p>
                  <ul className="space-y-1 text-xs">
                    <li>✓ Unique sharing link generated</li>
                    <li>✓ Auto-expires based on time/views (if set)</li>
                    <li>✓ Safe HTML rendering (XSS protected)</li>
                    <li>✓ Persistent storage with Vercel KV</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Information Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">💡 How It Works</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex gap-3">
                  <span className="text-2xl">1️⃣</span>
                  <p>
                    <strong>Create:</strong> Paste your text and optionally set expiry time
                    or view limits
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">2️⃣</span>
                  <p>
                    <strong>Share:</strong> Copy the generated link and share with others
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">3️⃣</span>
                  <p>
                    <strong>View:</strong> Recipients see the paste content without needing
                    to create an account
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">4️⃣</span>
                  <p>
                    <strong>Expire:</strong> Paste automatically expires based on your
                    constraints
                  </p>
                </div>
              </div>

              {/* Constraints Info */}
              <div className="mt-6 bg-purple-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">⚙️ Optional Constraints</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>
                    <strong>Expiry Time:</strong> Paste disappears after the specified seconds
                  </li>
                  <li>
                    <strong>View Limit:</strong> Paste disappears after being viewed N times
                  </li>
                  <li>
                    <strong>Combined:</strong> Whichever limit is reached first takes effect
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-blue-100 text-sm">
            Pastebin Lite • Built with Next.js • Data persisted with Vercel KV
          </p>
        </div>
      </div>
    </div>
  );
}
