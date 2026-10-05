import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hisaab Dost (हिसाब दोस्त) — Local & Private Expense Companion",
  description: "Local-first expense tracking powered by Gemma on Ollama. Your messy Hinglish and UPI SMS turned into clean records without any cloud AI or sync.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                ☕
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-white tracking-tight">Hisaab Dost</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    हिसाब दोस्त
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Local AI Companion for Priya</p>
              </div>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/add"
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold hover:from-amber-400 hover:to-orange-400 transition shadow-sm flex items-center gap-1.5"
              >
                <span>+</span> Quick Add
              </Link>
              <Link
                href="/settings"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Settings
              </Link>
            </nav>
          </div>
        </header>

        <div className="bg-emerald-950/40 border-b border-emerald-900/50 py-1.5 px-4 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            <strong>Private &amp; local:</strong> Data stays in local SQLite. All parsing runs on local Gemma via Ollama. No cloud AI, no analytics. (Voice input uses your browser&apos;s speech service.)
          </span>
        </div>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-400">
          <p>Hisaab Dost — Built for Priya · Hacktoberfest 2026 Weekend Challenge</p>
          <p className="mt-1">Powered by Google Gemma on Ollama · SQLite · Next.js</p>
        </footer>
      </body>
    </html>
  );
}
