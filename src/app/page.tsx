"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MonthSummary, CategorySummary } from "@/lib/summary";
import { Expense } from "@/lib/db";

export default function Dashboard() {
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [ollamaOk, setOllamaOk] = useState(true);
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Weekly insight state
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, expRes, statusRes] = await Promise.all([
        fetch("/api/summary"),
        fetch("/api/expenses?limit=50"),
        fetch("/api/status"),
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData.summary);
      }

      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData.expenses);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setOllamaOk(statusData.available);
        if (!statusData.available || statusData.error) {
          setOllamaError(statusData.error || "Ollama service unavailable");
        } else {
          setOllamaError(null);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleGenerateInsight = async () => {
    try {
      setLoadingInsight(true);
      const res = await fetch("/api/weekly", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setInsight(data.insight);
      } else {
        setInsight(data.insight || "Could not generate insight right now.");
      }
    } catch {
      setInsight("Network error connecting to local Gemma model.");
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        // Refresh summary
        const sumRes = await fetch("/api/summary");
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setSummary(sumData.summary);
        }
      }
    } catch (err) {
      alert("Failed to delete: " + err);
    }
  };

  const filteredExpenses = selectedCategory === "all"
    ? expenses
    : expenses.filter((e) => e.category === selectedCategory);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-400">Loading Hisaab Dost...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Ollama Alert if offline */}
      {!ollamaOk && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-300">⚠️ Local Ollama Service Not Detected</p>
            <p className="mt-1 text-xs text-amber-400/80">
              {ollamaError || "Please ensure Ollama is running locally for AI parsing."}
            </p>
            <code className="mt-2 inline-block px-2.5 py-1 rounded bg-slate-900 text-xs font-mono text-amber-300 border border-amber-500/20">
              ollama run gemma4:12b
            </code>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 text-xs rounded bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400"
          >
            Retry Check
          </button>
        </div>
      )}

      {/* Hero Runway Card */}
      {summary && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
                Priya&apos;s Month Runway ({summary.monthName})
              </span>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  ₹{summary.safeDailyAllowance.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-medium text-slate-400">/ day safe spending limit</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-300">
                {summary.willLastMonth ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Safe pace! At current burn rate, your allowance will comfortably last all {summary.daysRemaining} remaining days.
                  </span>
                ) : (
                  <span className="text-rose-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                    Warning: At current burn (₹{summary.currentDailyPace}/day), allowance runs out around{" "}
                    <strong>{summary.runwayDate}</strong>!
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="text-right">
                <p className="text-xs text-slate-400">Total Spent</p>
                <p className="text-xl font-bold text-white">₹{summary.totalSpent.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-slate-400">Budget: ₹{summary.budget.toLocaleString("en-IN")}</p>
              </div>
              <div className="h-10 w-px bg-slate-800"></div>
              <div className="text-left">
                <p className="text-xs text-slate-400">Remaining</p>
                <p className={`text-xl font-bold ${summary.remainingBudget < 1000 ? "text-rose-400" : "text-emerald-400"}`}>
                  ₹{summary.remainingBudget.toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-slate-400">{summary.daysRemaining} days left</p>
              </div>
            </div>
          </div>

          {/* Budget progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>{summary.percentSpent}% of allowance used</span>
              <span>{Math.round(100 - summary.percentSpent)}% buffer left</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.percentSpent > 85
                    ? "bg-rose-500"
                    : summary.percentSpent > 60
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, summary.percentSpent)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Gemma AI Advice Card */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg">
              ✨
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Gemma Dost Insight</h3>
              <p className="text-xs text-slate-400">Honest, private advice phrased by local Gemma on your numbers</p>
            </div>
          </div>

          <button
            onClick={handleGenerateInsight}
            disabled={loadingInsight}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition flex items-center justify-center gap-2"
          >
            {loadingInsight ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Gemma thinking...
              </>
            ) : (
              <>
                <span>💡</span> Ask Gemma
              </>
            )}
          </button>
        </div>

        {insight && (
          <div className="mt-4 p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 text-sm leading-relaxed whitespace-pre-line animate-fadeIn">
            {insight}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {summary && summary.categories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>📊</span> Where Did My Money Go?
            </h2>
            <span className="text-xs text-slate-400">{summary.categories.length} categories active</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {summary.categories.map((c: CategorySummary) => (
              <div
                key={c.category}
                onClick={() => setSelectedCategory(selectedCategory === c.category ? "all" : c.category)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedCategory === c.category
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{c.icon}</span>
                  <span className="text-[11px] font-semibold text-slate-400">{c.percentage}%</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-200 truncate">{c.label}</p>
                <p className="text-base font-bold text-white mt-0.5">₹{c.total.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-slate-400">{c.count} transactions</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Recent Transactions</h2>
            <p className="text-xs text-slate-400">
              Showing {filteredExpenses.length} entries {selectedCategory !== "all" && `(filtered by ${selectedCategory})`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-xs text-amber-400 hover:underline"
              >
                Clear filter
              </button>
            )}
            <a
              href="/api/export"
              download
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <span>📥</span> Export CSV
            </a>
            <Link
              href="/add"
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition"
            >
              + Add New
            </Link>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <span className="text-3xl">📝</span>
            <p className="mt-2 font-medium text-slate-300">No expenses recorded yet</p>
            <p className="text-xs mt-1 text-slate-400">
              Type something messy like &quot;chai 20, auto 60&quot; or paste a UPI SMS to get started!
            </p>
            <Link
              href="/add"
              className="mt-4 inline-block px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400"
            >
              Add First Expense
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{e.spent_on}</td>
                    <td className="py-3 px-4 font-medium text-white capitalize">{e.item}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700/50">
                        {e.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        e.source === "sms" ? "bg-cyan-950 text-cyan-400 border border-cyan-800/40" : "bg-slate-800 text-slate-400"
                      }`}>
                        {e.source.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white whitespace-nowrap">
                      ₹{e.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(e.id)}
                        className="text-slate-400 hover:text-rose-400 transition text-sm p-1"
                        title="Delete expense"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
