import { addExpenses, getExpenses } from "../src/lib/db";

function seed() {
  const existing = getExpenses();
  if (existing.length > 0) {
    console.log(`Database already has ${existing.length} expenses. Skipping seed.`);
    return;
  }

  console.log("Seeding initial hostel expenses for Priya...");
  const today = new Date();

  const getDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  const sampleData = [
    { amount: 3500, item: "mess fee october", category: "rent_mess" as const, spent_on: getDate(3), source: "text" as const },
    { amount: 60, item: "auto to college", category: "transport" as const, spent_on: getDate(2), source: "text" as const },
    { amount: 20, item: "cutting chai with friends", category: "chai_snacks" as const, spent_on: getDate(2), source: "text" as const },
    { amount: 40, item: "canteen maggi", category: "chai_snacks" as const, spent_on: getDate(1), source: "text" as const },
    { amount: 150, item: "swiggy dinner", category: "food" as const, spent_on: getDate(1), source: "sms" as const },
    { amount: 239, item: "jio recharge 1.5gb/day", category: "recharge_bills" as const, spent_on: getDate(1), source: "sms" as const },
    { amount: 50, item: "xerox and lab manual print", category: "education" as const, spent_on: getDate(0), source: "text" as const },
    { amount: 30, item: "chai and samosa", category: "chai_snacks" as const, spent_on: getDate(0), source: "text" as const },
  ];

  const inserted = addExpenses(sampleData);
  console.log(`Successfully seeded ${inserted.length} sample expenses!`);
}

seed();
