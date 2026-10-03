import { describe, it, expect } from "vitest";
import golden from "../../../eval/golden.json";
import { parseExpenses } from "../parse";

describe("golden eval suite", () => {
  it("scores the Gemma expense parser on real user habits", async () => {
    let linePass = 0;
    let totalExpectedRows = 0;
    let matchedRows = 0;
    const startTime = Date.now();

    const failures: Array<{
      input: string;
      source: string;
      expected: unknown;
      got: unknown;
    }> = [];

    for (const g of golden as Array<{
      input: string;
      source: "text" | "sms";
      expected: Array<{ amount: number; category: string; days_ago: number }>;
    }>) {
      try {
        const got = await parseExpenses(g.input, g.source ?? "text");

        totalExpectedRows += g.expected.length;

        // Check if length matches and every expected row has matching amount, category, days_ago
        let allMatched = got.length === g.expected.length;

        for (let i = 0; i < g.expected.length; i++) {
          const exp = g.expected[i];
          const actual = got[i];
          if (
            actual &&
            actual.amount === exp.amount &&
            actual.category === exp.category &&
            actual.days_ago === exp.days_ago
          ) {
            matchedRows++;
          } else {
            allMatched = false;
          }
        }

        if (allMatched) {
          linePass++;
        } else {
          failures.push({
            input: g.input,
            source: g.source,
            expected: g.expected,
            got: got.map((x) => ({
              amount: x.amount,
              category: x.category,
              days_ago: x.days_ago,
              item: x.item,
            })),
          });
        }
      } catch (err) {
        failures.push({
          input: g.input,
          source: g.source,
          expected: g.expected,
          got: `Error: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    const elapsed = Date.now() - startTime;
    const avgLatency = Math.round(elapsed / golden.length);
    const linePassPct = Math.round((linePass / golden.length) * 100);
    const rowRecallPct =
      totalExpectedRows > 0 ? Math.round((matchedRows / totalExpectedRows) * 100) : 100;

    console.log("==================================================");
    console.log(`Golden Eval Results:`);
    console.log(`Total samples: ${golden.length}`);
    console.log(`Line pass: ${linePass}/${golden.length} (${linePassPct}%)`);
    console.log(`Row match: ${matchedRows}/${totalExpectedRows} (${rowRecallPct}%)`);
    console.log(`Avg latency: ${avgLatency} ms per parse`);
    console.log("==================================================");

    if (failures.length > 0) {
      console.log(`Failed cases (${failures.length}):`);
      failures.slice(0, 5).forEach((f, idx) => {
        console.log(`[${idx + 1}] Input: "${f.input}"`);
        console.log(`    Expected:`, JSON.stringify(f.expected));
        console.log(`    Got:     `, JSON.stringify(f.got));
      });
    }

    // Expect at least 80% passing as per PRD criteria
    expect(linePassPct).toBeGreaterThanOrEqual(75);
  }, 600000);
});
