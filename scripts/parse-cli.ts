import { parseExpenses } from "../src/lib/parse";

async function main() {
  const input = process.argv.slice(2).join(" ");
  if (!input) {
    console.log('Usage: npx tsx scripts/parse-cli.ts "chai 20, auto 60" [text|sms]');
    process.exit(1);
  }

  const isSms = input.toLowerCase().includes("debited") || input.toLowerCase().includes("credited") || input.toLowerCase().includes("txn");
  const source = isSms ? "sms" : "text";

  console.log(`Parsing (${source}): "${input}"...\n`);
  try {
    const expenses = await parseExpenses(input, source);
    console.log(JSON.stringify(expenses, null, 2));
  } catch (err) {
    console.error("Error parsing expenses:", err);
    process.exit(1);
  }
}

main();
