"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, CATEGORY_MAP, Category } from "@/lib/categories";

interface PreviewRow {
  amount: number;
  item: string;
  category: Category;
  spent_on: string;
  days_ago: number;
  needs_review: boolean;
  is_duplicate?: boolean;
  source?: "text" | "sms";
}

// Extend Window interface for speech recognition
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export default function AddPage() {
  const router = useRouter();
  const [source, setSource] = useState<"text" | "sms">("text");
  const [inputText, setInputText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "hi-IN"; // Hindi/Hinglish speech model

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev}, ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeech = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleParse = async () => {
    if (!inputText.trim()) return;
    try {
      setParsing(true);
      setError(null);

      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, source }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse text with local Gemma model.");
      }

      if (data.expenses.length === 0) {
        setError("Gemma found no expense debits in the text. Make sure it contains an amount or debit alert.");
      } else {
        setPreviewRows(data.expenses);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setParsing(false);
    }
  };

  const handleUpdateRow = (index: number, field: keyof PreviewRow, value: any) => {
    setPreviewRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteRow = (index: number) => {
    setPreviewRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (previewRows.length === 0) return;
    try {
      setSaving(true);
      setError(null);

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenses: previewRows }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save expenses.");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setSaving(false);
    }
  };

  const sampleChips = source === "text"
    ? [
        "chai 20, auto 60, mess 3500",
        "kal maggi 40 aur parso recharge 239",
        "canteen lunch 80",
        "shopping kurti 1.5k",
        "rohit ko 500 udhaar",
      ]
    : [
        "Paid Rs.40.00 to Sharma Canteen on 04 Oct 2026. Txn ID 827192",
        "INR 250.00 debited from A/C XX4091 towards SWIGGY UPI Ref 92837",
        "Paid Rs.60.00 to Auto Rickshaw via PhonePe on 04-10-2026",
      ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>⚡</span> Quick Add Expense
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Type or speak messy Hinglish, or paste bank SMS. Gemma extracts clean records.
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Input Source Tabs */}
      <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => {
            setSource("text");
            setPreviewRows([]);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
            source === "text"
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          💬 Free Text / Hinglish / Voice
        </button>
        <button
          onClick={() => {
            setSource("sms");
            setPreviewRows([]);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
            source === "sms"
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          📲 UPI / Bank SMS Paste
        </button>
      </div>

      {/* Input Box Card */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            {source === "text" ? "Type or Speak your expenses:" : "Paste Bank or UPI SMS Alerts:"}
          </label>
          {speechSupported && source === "text" && (
            <button
              onClick={toggleSpeech}
              className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                isListening
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <span>{isListening ? "🔴 Listening..." : "🎙️ Speak in Hinglish"}</span>
            </button>
          )}
        </div>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            source === "text"
              ? "e.g. chai 20, auto 60 to college, kal maggi 40, rohit ko 500 udhaar diye"
              : "Paste one or more SMS alerts here (e.g. Paid Rs.120 to Swiggy on 04-Oct...)"
          }
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none font-sans"
        />

        {/* Quick Example Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400">Try quick example:</span>
          {sampleChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(chip)}
              className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition truncate max-w-[220px]"
            >
              {chip}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          {inputText && (
            <button
              onClick={() => {
                setInputText("");
                setPreviewRows([]);
              }}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleParse}
            disabled={parsing || !inputText.trim()}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            {parsing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                Gemma Parsing...
              </>
            ) : (
              <>
                <span>✨</span> Parse with Gemma
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editable Preview Table before saving */}
      {previewRows.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden space-y-4 p-5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📋</span> Preview &amp; Edit Before Saving
              </h2>
              <p className="text-[11px] text-slate-400">
                Gemma extracted {previewRows.length} item(s). Adjust any category or amount if needed.
              </p>
            </div>
            <button
              onClick={() =>
                setPreviewRows((prev) => [
                  ...prev,
                  {
                    amount: 0,
                    item: "New Item",
                    category: "other",
                    spent_on: new Date().toISOString().split("T")[0],
                    days_ago: 0,
                    needs_review: true,
                  },
                ])
              }
              className="text-xs text-amber-400 hover:underline"
            >
              + Add Row
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3">
                      <input
                        type="date"
                        value={row.spent_on}
                        onChange={(e) => handleUpdateRow(idx, "spent_on", e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.item}
                        onChange={(e) => handleUpdateRow(idx, "item", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500 capitalize"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={row.category}
                        onChange={(e) => handleUpdateRow(idx, "category", e.target.value as Category)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {CATEGORY_MAP[cat]?.icon} {CATEGORY_MAP[cat]?.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.amount || ""}
                        onChange={(e) => handleUpdateRow(idx, "amount", parseFloat(e.target.value) || 0)}
                        className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-amber-500 text-right"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      {row.is_duplicate ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-medium border border-amber-500/30">
                          Duplicate?
                        </span>
                      ) : row.needs_review || row.amount <= 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-medium border border-rose-500/30">
                          Review
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-medium border border-emerald-500/30">
                          ✓ Ready
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="text-slate-400 hover:text-rose-400 transition text-sm"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400">
              Total to save:{" "}
              <strong className="text-white">
                ₹{previewRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0).toLocaleString("en-IN")}
              </strong>
            </p>
            <button
              onClick={handleSaveAll}
              disabled={saving || previewRows.some((r) => r.amount <= 0)}
              className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/10 flex items-center gap-2"
            >
              {saving ? "Saving to Hisaab..." : "✓ Confirm & Save All"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
