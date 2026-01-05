import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pastebin Lite - Share Text Securely",
  description: "Create and share text pastes with optional TTL and view count limits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <main style={{ flex: 1 }}>{children}</main>
          <footer style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
            Pastebin Lite • Built with Next.js • Data persisted with Vercel KV — Author: sathish
          </footer>
        </div>
      </body>
    </html>
  );
}
