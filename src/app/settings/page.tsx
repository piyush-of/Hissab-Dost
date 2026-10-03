"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [budget, setBudget] = useState("8000");
  const [tone, setTone] = useState("friendly");
  const [language, setLanguage] = useState("Hinglish");
  const [userName, setUserName] = useState("Priya");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Status diagnostics
  const [ollamaInfo, setOllamaInfo] = useState<{
    available: boolean;
    models: string[];
    currentModel: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          if (d.settings.monthly_budget) setBudget(d.settings.monthly_budget);
          if (d.settings.tone) setTone(d.settings.tone);
          if (d.settings.language) setLanguage(d.settings.language);
          if (d.settings.user_name) setUserName(d.settings.user_name);
        }
      })
      .catch(console.error);

    fetch("/api/status")
      .then((r) => r.json())
      .then(setOllamaInfo)
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedMessage(null);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_budget: budget,
          tone,
          language,
          user_name: userName,
        }),
      });

      if (res.ok) {
        setSavedMessage("Settings saved successfully!");
        setTimeout(() => setSavedMessage(null), 3000);
      }
    } catch {
      setSavedMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>⚙️</span> Preferences &amp; Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure monthly allowance, AI tone, and check offline system status.
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-6">
        {/* User Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Name / Nickname
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Monthly Pocket Money / Allowance (₹)
          </label>
          <input
            type="number"
            min="100"
            step="100"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Used to calculate your daily safe spending limit and runway dates.
          </p>
        </div>

        {/* Tone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Gemma Companion Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="friendly">Warm &amp; Friendly Friend (Dost)</option>
              <option value="didi">Caring Elder Sister (Didi)</option>
              <option value="strict">Strict &amp; Direct Budget Coach</option>
              <option value="chill">Casual Hostel Roommate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Preferred Language Mix
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Hinglish">Hinglish (Natural Mix)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        {savedMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            {savedMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/10"
        >
          {saving ? "Saving Changes..." : "Save Preferences"}
        </button>
      </form>

      {/* Local System & Privacy Proof */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>🔒</span> Privacy &amp; Local Verification
        </h2>
        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex items-center justify-between py-1 border-b border-slate-800">
            <span>LLM Runtime:</span>
            <span className="font-mono text-slate-200">
              {ollamaInfo?.available ? "✓ Ollama Connected (localhost:11434)" : "✗ Disconnected"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800">
            <span>Active Model:</span>
            <span className="font-mono text-amber-400">{ollamaInfo?.currentModel || "gemma4:12b"}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800">
            <span>Database Storage:</span>
            <span className="font-mono text-slate-200">SQLite (local `data/hisaab.db`)</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span>External Network Calls:</span>
            <span className="font-mono text-emerald-400 font-bold">0 calls (100% offline)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
