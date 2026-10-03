import { NextRequest, NextResponse } from "next/server";
import { getMonthSummary } from "@/lib/summary";
import { getSetting } from "@/lib/db";
import { buildWeeklySummaryPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const summary = getMonthSummary();
    const tone = getSetting("tone", "friendly");
    const language = getSetting("language", "Hinglish");

    const promptData = {
      month: summary.monthName,
      allowance_budget: `₹${summary.budget}`,
      total_spent_so_far: `₹${summary.totalSpent}`,
      remaining_allowance: `₹${summary.remainingBudget}`,
      days_left_in_month: summary.daysRemaining,
      safe_daily_spend_limit: `₹${summary.safeDailyAllowance}/day`,
      current_daily_pace: `₹${summary.currentDailyPace}/day`,
      will_last_month: summary.willLastMonth,
      estimated_runway_date: summary.runwayDate || "lasts till month end",
      top_category: summary.topCategory ? `${summary.topCategory.label} (₹${summary.topCategory.total}, ${summary.topCategory.percentage}%)` : "none yet",
      categories: summary.categories.map((c) => `${c.label}: ₹${c.total} (${c.percentage}%)`),
    };

    const systemPrompt = buildWeeklySummaryPrompt(
      JSON.stringify(promptData, null, 2),
      language,
      tone
    );

    const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
    const MODEL = process.env.OLLAMA_MODEL || "gemma4:12b";

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Mujhe iss week ka summary aur friendly advice do." },
        ],
        stream: false,
        options: { temperature: 0.3 },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      throw new Error(`Ollama returned status ${res.status}`);
    }

    const data = await res.json();
    const insight = data.message?.content?.trim() || "Sab theek chal raha hai, budget control mein rakhein!";

    return NextResponse.json({
      success: true,
      insight,
      summary,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        insight: "Abhi summary generate nahi ho pa rahi. Ollama check karein!",
        error: msg,
      },
      { status: 500 }
    );
  }
}
