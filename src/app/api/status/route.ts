import { NextResponse } from "next/server";
import { checkOllamaStatus } from "@/lib/ollama";

export async function GET() {
  try {
    const status = await checkOllamaStatus();
    return NextResponse.json(status);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { available: false, models: [], currentModel: "unknown", error: msg },
      { status: 500 }
    );
  }
}
