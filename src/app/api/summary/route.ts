import { NextRequest, NextResponse } from "next/server";
import { getMonthSummary } from "@/lib/summary";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const summary = getMonthSummary(targetDate);
    return NextResponse.json({ success: true, summary });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
