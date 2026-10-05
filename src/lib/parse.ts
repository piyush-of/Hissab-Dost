import { z } from "zod";
import { CATEGORIES, Category } from "./categories";
import { chatJSON } from "./ollama";
import { toLocalISODate } from "./dates";
import {
  EXPENSE_JSON_SCHEMA,
  SYSTEM_PROMPT_TEXT,
  SYSTEM_PROMPT_SMS,
  FEW_SHOT_EXAMPLES,
} from "./prompts";

export const ExpenseItemSchema = z.object({
  amount: z.coerce.number().min(0),
  item: z.string().min(1).default("miscellaneous"),
  category: z.enum(CATEGORIES).catch("other"),
  days_ago: z.coerce.number().int().min(0).default(0),
  needs_review: z.boolean().default(false),
});

export const ParseResponseSchema = z.object({
  expenses: z.array(ExpenseItemSchema),
});

export type RawExpense = z.infer<typeof ExpenseItemSchema>;

export interface ParsedExpense {
  amount: number;
  item: string;
  category: Category;
  days_ago: number;
  spent_on: string; // YYYY-MM-DD
  needs_review: boolean;
  raw_text: string;
  source: "text" | "sms";
}

export function daysAgoToDate(daysAgo: number, baseDate = new Date()): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - Math.max(0, daysAgo));
  return toLocalISODate(d);
}

export async function parseExpenses(
  text: string,
  source: "text" | "sms" = "text",
  options: { model?: string; baseDate?: Date } = {}
): Promise<ParsedExpense[]> {
  const cleanInput = text.trim();
  if (!cleanInput) return [];

  const systemPrompt = source === "sms" ? SYSTEM_PROMPT_SMS : SYSTEM_PROMPT_TEXT;

  let rawData: unknown;
  try {
    // Attempt 1: Fast direct with schema and few shots
    rawData = await chatJSON(systemPrompt, cleanInput, EXPENSE_JSON_SCHEMA, {
      model: options.model,
      fewShots: FEW_SHOT_EXAMPLES,
      temperature: 0,
    });
  } catch (err) {
    console.warn("First parse attempt failed, retrying once...", err);
    // Attempt 2: Retry
    rawData = await chatJSON(systemPrompt, cleanInput, EXPENSE_JSON_SCHEMA, {
      model: options.model,
      fewShots: FEW_SHOT_EXAMPLES,
      temperature: 0.1,
    });
  }

  const parsed = ParseResponseSchema.safeParse(rawData);
  if (!parsed.success) {
    console.error("Zod schema validation failed on Ollama output:", parsed.error);
    throw new Error(`Invalid structured response from LLM: ${parsed.error.message}`);
  }

  const baseDate = options.baseDate || new Date();

  return parsed.data.expenses.map((e) => ({
    amount: e.amount,
    item: e.item.trim(),
    category: e.category as Category,
    days_ago: e.days_ago,
    spent_on: daysAgoToDate(e.days_ago, baseDate),
    needs_review: e.needs_review || e.amount <= 0,
    raw_text: cleanInput,
    source,
  }));
}
