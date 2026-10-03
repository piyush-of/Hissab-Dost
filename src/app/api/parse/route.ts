import { NextRequest, NextResponse } from "next/server";
import { parseExpenses } from "@/lib/parse";
import { findDuplicates } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, source = "text" } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required to parse expenses" },
        { status: 400 }
      );
    }

    const parsedRows = await parseExpenses(text, source as "text" | "sms");

    // Check duplicate warnings for preview table
    const enhancedRows = parsedRows.map((row) => {
      const existing = findDuplicates(row.amount, row.item, row.spent_on);
      return {
        ...row,
        is_duplicate: existing.length > 0,
        duplicate_count: existing.length,
      };
    });

    return NextResponse.json({
      success: true,
      count: enhancedRows.length,
      expenses: enhancedRows,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Parse route error:", msg);
    return NextResponse.json(
      {
        error: msg,
        hint: "Ensure Ollama is running (`ollama serve`) and model is pulled.",
      },
      { status: 500 }
    );
  }
}
