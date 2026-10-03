import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { Category } from "./categories";

export interface Expense {
  id: number;
  amount: number;
  item: string;
  category: Category;
  spent_on: string; // YYYY-MM-DD
  raw_text?: string;
  source: "text" | "sms";
  created_at: string;
}

export interface ExpenseInput {
  amount: number;
  item: string;
  category: Category;
  spent_on: string;
  raw_text?: string;
  source?: "text" | "sms";
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dbDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, "hisaab.db");
  const db = new Database(dbPath);

  // Enable WAL mode for performance and concurrency
  db.pragma("journal_mode = WAL");

  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL CHECK (amount > 0),
      item TEXT NOT NULL,
      category TEXT NOT NULL,
      spent_on TEXT NOT NULL,
      raw_text TEXT,
      source TEXT DEFAULT 'text',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_spent_on ON expenses(spent_on);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
  `);

  // Default settings if empty
  const defaultSettings: Record<string, string> = {
    monthly_budget: "8000", // Priya's hostel allowance typical estimate
    tone: "friendly",
    language: "Hinglish",
    user_name: "Priya",
  };

  const getStmt = db.prepare("SELECT value FROM settings WHERE key = ?");
  const setStmt = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");

  for (const [key, val] of Object.entries(defaultSettings)) {
    const existing = getStmt.get(key);
    if (!existing) {
      setStmt.run(key, val);
    }
  }

  dbInstance = db;
  return db;
}

export function addExpenses(items: ExpenseInput[]): Expense[] {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO expenses (amount, item, category, spent_on, raw_text, source)
    VALUES (@amount, @item, @category, @spent_on, @raw_text, @source)
  `);

  const results: Expense[] = [];
  const insertMany = db.transaction((rows: ExpenseInput[]) => {
    for (const row of rows) {
      if (row.amount <= 0) continue; // Skip zero/invalid entries
      const res = insert.run({
        amount: row.amount,
        item: row.item,
        category: row.category,
        spent_on: row.spent_on,
        raw_text: row.raw_text || null,
        source: row.source || "text",
      });
      results.push({
        id: Number(res.lastInsertRowid),
        amount: row.amount,
        item: row.item,
        category: row.category,
        spent_on: row.spent_on,
        raw_text: row.raw_text,
        source: row.source || "text",
        created_at: new Date().toISOString(),
      });
    }
  });

  insertMany(items);
  return results;
}

export function getExpenses(options: {
  limit?: number;
  month?: string; // YYYY-MM
  category?: string;
  source?: string;
} = {}): Expense[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (options.month) {
    conditions.push("spent_on LIKE @month");
    params.month = `${options.month}%`;
  }

  if (options.category) {
    conditions.push("category = @category");
    params.category = options.category;
  }

  if (options.source) {
    conditions.push("source = @source");
    params.source = options.source;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limitClause = options.limit ? `LIMIT ${options.limit}` : "LIMIT 500";

  const stmt = db.prepare(`
    SELECT id, amount, item, category, spent_on, raw_text, source, created_at
    FROM expenses
    ${whereClause}
    ORDER BY spent_on DESC, id DESC
    ${limitClause}
  `);

  return stmt.all(params) as Expense[];
}

export function deleteExpense(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM expenses WHERE id = ?");
  const res = stmt.run(id);
  return res.changes > 0;
}

export function updateExpense(id: number, updates: Partial<ExpenseInput>): boolean {
  const db = getDb();
  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  if (updates.amount !== undefined) {
    fields.push("amount = @amount");
    params.amount = updates.amount;
  }
  if (updates.item !== undefined) {
    fields.push("item = @item");
    params.item = updates.item;
  }
  if (updates.category !== undefined) {
    fields.push("category = @category");
    params.category = updates.category;
  }
  if (updates.spent_on !== undefined) {
    fields.push("spent_on = @spent_on");
    params.spent_on = updates.spent_on;
  }

  if (fields.length === 0) return false;

  const stmt = db.prepare(`
    UPDATE expenses
    SET ${fields.join(", ")}
    WHERE id = @id
  `);

  const res = stmt.run(params);
  return res.changes > 0;
}

export function findDuplicates(amount: number, item: string, spent_on: string): Expense[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, amount, item, category, spent_on, created_at
    FROM expenses
    WHERE amount = ? AND lower(trim(item)) = lower(trim(?)) AND spent_on = ?
  `);
  return stmt.all(amount, item, spent_on) as Expense[];
}

export function getSetting(key: string, defaultValue = ""): string {
  const db = getDb();
  const stmt = db.prepare("SELECT value FROM settings WHERE key = ?");
  const res = stmt.get(key) as { value: string } | undefined;
  return res ? res.value : defaultValue;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run(key, value);
}

export function getAllSettings(): Record<string, string> {
  const db = getDb();
  const stmt = db.prepare("SELECT key, value FROM settings");
  const rows = stmt.all() as Array<{ key: string; value: string }>;
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return map;
}
