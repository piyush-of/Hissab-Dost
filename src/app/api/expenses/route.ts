import { NextRequest, NextResponse } from "next/server";
import {
  getExpenses,
  addExpenses,
  deleteExpense,
  updateExpense,
  ExpenseInput,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || undefined;
    const category = searchParams.get("category") || undefined;
    const source = searchParams.get("source") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const expenses = getExpenses({ month, category, source, limit });
    return NextResponse.json({ success: true, count: expenses.length, expenses });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let itemsToInsert: ExpenseInput[] = [];

    if (Array.isArray(body.expenses)) {
      itemsToInsert = body.expenses;
    } else if (body.amount && body.item) {
      itemsToInsert = [body as ExpenseInput];
    } else {
      return NextResponse.json(
        { error: "Provide an array 'expenses' or a single expense object" },
        { status: 400 }
      );
    }

    // Filter valid items
    const validItems = itemsToInsert.filter((i) => i.amount > 0 && i.item?.trim());
    if (validItems.length === 0) {
      return NextResponse.json(
        { error: "No valid expense items found with positive amount" },
        { status: 400 }
      );
    }

    const inserted = addExpenses(validItems);
    return NextResponse.json({
      success: true,
      message: `Successfully saved ${inserted.length} expense(s)`,
      expenses: inserted,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id") ? parseInt(searchParams.get("id")!) : NaN;

    if (isNaN(id)) {
      const body = await req.json().catch(() => ({}));
      id = parseInt(body.id);
    }

    if (isNaN(id)) {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    }

    const deleted = deleteExpense(id);
    if (!deleted) {
      return NextResponse.json({ error: "Expense not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Deleted expense #${id}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = parseInt(body.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    }

    const updated = updateExpense(id, {
      amount: body.amount ? Number(body.amount) : undefined,
      item: body.item,
      category: body.category,
      spent_on: body.spent_on,
    });

    if (!updated) {
      return NextResponse.json({ error: "Could not update expense or no changes made" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Updated expense #${id}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
