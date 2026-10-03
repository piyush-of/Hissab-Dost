import { CATEGORIES } from "./categories";

export const EXPENSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    expenses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          amount: { type: "number" },
          item: { type: "string" },
          category: {
            type: "string",
            enum: [...CATEGORIES],
          },
          days_ago: { type: "integer" },
          needs_review: { type: "boolean" },
        },
        required: ["amount", "item", "category", "days_ago", "needs_review"],
        additionalProperties: false,
      },
    },
  },
  required: ["expenses"],
  additionalProperties: false,
};

export const SYSTEM_PROMPT_TEXT = `You extract expenses from short, messy messages written in English, Hindi, or Hinglish.
Return JSON only, matching the exact schema.

Rules:
- One object per separate purchase or expense item.
- amount: the rupee number only. e.g. "1.5k" = 1500, "2 hazaar" = 2000, "500rs" = 500, "₹250" = 250. Strip all currency words and symbols.
- item: short lowercase noun phrase (e.g. "chai", "auto to college", "canteen lunch", "kurtis").
- category: pick the closest category strictly from: ${CATEGORIES.join(", ")}. If unsure, choose "other".
- days_ago: 0 for today or when no date is specified. 1 for "kal" / "yesterday". 2 for "parso" / "day before yesterday". Otherwise count back days.
- If a line or item has no clear or mentioned amount, still output it with amount 0 and needs_review true.
- Money the user lent to someone ("udhaar", "diye", "rohit ko diye", "lent to") MUST be category "lent_money".
- Do not invent expenses. Never add commentary outside JSON.`;

export const SYSTEM_PROMPT_SMS = `You read Indian bank and UPI SMS alerts. Extract only DEBIT transactions (money spent or sent out: words like "debited", "paid to", "sent to", "spent", "transferred to").
Ignore credit transactions ("credited", "received"), OTP messages, balance inquiries, promotional spam, and card limits.
If the SMS is not an expense/debit, return an empty array {"expenses": []}.

Rules:
- amount: rupee numeric value debited (e.g. "Rs. 180.00" -> 180).
- item: recipient or merchant name in clean lowercase (e.g. "swiggy", "amul parlour", "priya sharma", "metro qr").
- category: closest guess from: ${CATEGORIES.join(", ")}. Food/mess/swiggy -> "food", chai/bakery -> "chai_snacks", auto/ola/uber/metro -> "transport", recharge -> "recharge_bills", friend transfer -> "lent_money" or "other".
- days_ago: 0 unless the SMS explicitly mentions an earlier date.
- needs_review: false for clear debits, true if uncertain.
Return JSON only, matching the exact schema.`;

export const FEW_SHOT_EXAMPLES = [
  {
    role: "user",
    content: "chai 20, auto 60, mess 3500",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      expenses: [
        { amount: 20, item: "chai", category: "chai_snacks", days_ago: 0, needs_review: false },
        { amount: 60, item: "auto", category: "transport", days_ago: 0, needs_review: false },
        { amount: 3500, item: "mess", category: "rent_mess", days_ago: 0, needs_review: false },
      ],
    }),
  },
  {
    role: "user",
    content: "kal maggi 40 aur parso jio recharge 239",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      expenses: [
        { amount: 40, item: "maggi", category: "chai_snacks", days_ago: 1, needs_review: false },
        { amount: 239, item: "jio recharge", category: "recharge_bills", days_ago: 2, needs_review: false },
      ],
    }),
  },
  {
    role: "user",
    content: "rohit ko 500 udhaar diye",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      expenses: [
        { amount: 500, item: "rohit ko udhaar", category: "lent_money", days_ago: 0, needs_review: false },
      ],
    }),
  },
  {
    role: "user",
    content: "Your A/C ending 4512 debited by Rs.120.00 on 04-Oct-26 at ZOMATO UPI Ref 8273612",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      expenses: [
        { amount: 120, item: "zomato", category: "food", days_ago: 0, needs_review: false },
      ],
    }),
  },
];

export function buildWeeklySummaryPrompt(summaryJson: string, language = "Hinglish", tone = "friendly"): string {
  return `You are Hisaab Dost, a warm, supportive friend helping an Indian hostel student understand her spending.
Using ONLY the numbers provided in the JSON below, write 3 to 4 short, empathetic sentences in ${language} with a ${tone} tone.
Highlight:
1. The total spent this week and the biggest spending category.
2. The remaining safe daily allowance or runway until month-end.
3. One gentle, realistic tip (e.g. on chai/snacks or shopping) without lecturing or sounding preachy.

CRITICAL INSTRUCTION:
Do NOT calculate or invent numbers yourself. Use the exact numbers from the JSON. Keep it punchy and genuine.

JSON:
${summaryJson}`;
}
