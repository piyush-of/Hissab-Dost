import fs from "fs";
import path from "path";
import golden from "../eval/golden.json";
import { parseExpenses } from "../src/lib/parse";

async function runEval() {
  console.log(`Starting Golden Eval on ${golden.length} cases using local Gemma...`);
  let linePass = 0;
  let totalExpectedRows = 0;
  let matchedRows = 0;
  const startTime = Date.now();

  const details: Array<{
    index: number;
    input: string;
    source: string;
    pass: boolean;
    expected: any[];
    got: any[];
    latencyMs: number;
  }> = [];

  for (let i = 0; i < golden.length; i++) {
    const g = golden[i] as {
      input: string;
      source: "text" | "sms";
      expected: Array<{ amount: number; category: string; days_ago: number }>;
    };

    const itemStart = Date.now();
    try {
      const got = await parseExpenses(g.input, g.source ?? "text");
      const itemLatency = Date.now() - itemStart;

      totalExpectedRows += g.expected.length;

      let allMatched = got.length === g.expected.length;

      for (let j = 0; j < g.expected.length; j++) {
        const exp = g.expected[j];
        const actual = got[j];
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

      if (allMatched) linePass++;

      details.push({
        index: i + 1,
        input: g.input,
        source: g.source,
        pass: allMatched,
        expected: g.expected,
        got: got.map((x) => ({ amount: x.amount, category: x.category, days_ago: x.days_ago })),
        latencyMs: itemLatency,
      });

      console.log(`[${i + 1}/${golden.length}] ${allMatched ? "✅ PASS" : "❌ FAIL"} (${itemLatency}ms): "${g.input.slice(0, 40)}..."`);
    } catch (err) {
      console.log(`[${i + 1}/${golden.length}] ❌ ERROR: ${err}`);
      details.push({
        index: i + 1,
        input: g.input,
        source: g.source,
        pass: false,
        expected: g.expected,
        got: [{ error: String(err) }],
        latencyMs: Date.now() - itemStart,
      });
    }
  }

  const elapsed = Date.now() - startTime;
  const avgLatency = Math.round(elapsed / golden.length);
  const linePassPct = Math.round((linePass / golden.length) * 100);
  const rowRecallPct = totalExpectedRows > 0 ? Math.round((matchedRows / totalExpectedRows) * 100) : 100;

  console.log("\n================ EVAL SUMMARY ================");
  console.log(`Total samples:     ${golden.length}`);
  console.log(`Line Pass Rate:    ${linePass}/${golden.length} (${linePassPct}%)`);
  console.log(`Row Match Recall:  ${matchedRows}/${totalExpectedRows} (${rowRecallPct}%)`);
  console.log(`Avg Latency:       ${avgLatency} ms`);
  console.log("==============================================");

  // Write results to docs/EVAL_RESULTS.md
  const reportPath = path.join(process.cwd(), "docs", "EVAL_RESULTS.md");
  const reportContent = `# Hisaab Dost — Parser Golden Eval Report
Date: ${new Date().toISOString().split("T")[0]}
Model: Gemma (local via Ollama)

## Overall Metrics
- **Line Pass Accuracy:** ${linePass}/${golden.length} (**${linePassPct}%**)
- **Row-Level Recall:** ${matchedRows}/${totalExpectedRows} (**${rowRecallPct}%**)
- **Average Latency:** ${avgLatency} ms per parse

## Test Cases Breakdown
| # | Status | Input | Expected | Output | Latency |
|---|--------|-------|----------|--------|---------|
${details
  .map(
    (d) =>
      `| ${d.index} | ${d.pass ? "✅ PASS" : "❌ FAIL"} | \`${d.input.replace(/\|/g, "/")}\` | \`${JSON.stringify(
        d.expected
      )}\` | \`${JSON.stringify(d.got)}\` | ${d.latencyMs}ms |`
  )
  .join("\n")}
`;

  fs.writeFileSync(reportPath, reportContent, "utf-8");
  console.log(`Wrote eval report to ${reportPath}`);
}

runEval();
