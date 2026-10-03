import { NextRequest, NextResponse } from "next/server";
import { getAllSettings, setSetting } from "@/lib/db";

export async function GET() {
  try {
    const settings = getAllSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.key && body.value !== undefined) {
      setSetting(body.key, String(body.value));
    } else if (typeof body === "object") {
      for (const [k, v] of Object.entries(body)) {
        if (typeof v === "string" || typeof v === "number") {
          setSetting(k, String(v));
        }
      }
    } else {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updated = getAllSettings();
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
