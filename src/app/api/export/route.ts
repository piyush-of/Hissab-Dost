import { NextResponse } from "next/server";
import { getExpenses } from "@/lib/db";
import { toLocalISODate } from "@/lib/dates";

export async function GET() {
  try {
    const expenses = getExpenses({ limit: 10000 });

    const headers = [
      "ID",
      "Date (YYYY-MM-DD)",
      "Item",
      "Category",
      "Amount (INR)",
      "Source",
      "Created At",
    ];

    const escapeCsv = (val: unknown) => {
      const str = String(val ?? "").replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = expenses.map((e) => [
      e.id,
      e.spent_on,
      escapeCsv(e.item),
      escapeCsv(e.category),
      e.amount,
      e.source,
      escapeCsv(e.created_at),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const today = toLocalISODate();
    const filename = `hisaab-dost-expenses-${today}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
