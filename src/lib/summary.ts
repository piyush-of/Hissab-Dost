import { getDb, getSetting } from "./db";
import { Category, CATEGORY_MAP } from "./categories";

export interface CategorySummary {
  category: Category;
  label: string;
  hindiLabel: string;
  icon: string;
  color: string;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthSummary {
  month: string; // YYYY-MM
  monthName: string;
  budget: number;
  totalSpent: number;
  remainingBudget: number;
  percentSpent: number;
  daysInMonth: number;
  dayOfMonth: number;
  daysRemaining: number;
  currentDailyPace: number;
  safeDailyAllowance: number;
  runwayDate: string | null; // Date when allowance will run out at current pace
  willLastMonth: boolean;
  topCategory: CategorySummary | null;
  categories: CategorySummary[];
  recentCount: number;
}

export function getMonthSummary(targetDate = new Date()): MonthSummary {
  const db = getDb();
  const year = targetDate.getFullYear();
  const monthNum = targetDate.getMonth() + 1;
  const monthStr = `${year}-${String(monthNum).padStart(2, "0")}`;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = `${monthNames[targetDate.getMonth()]} ${year}`;

  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const dayOfMonth = targetDate.getDate();
  const daysRemaining = Math.max(1, daysInMonth - dayOfMonth + 1);

  const budgetStr = getSetting("monthly_budget", "8000");
  const budget = parseFloat(budgetStr) || 8000;

  // Aggregate monthly total and counts
  const totalStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM expenses
    WHERE spent_on LIKE ?
  `);
  const totalRes = totalStmt.get(`${monthStr}%`) as { total: number; count: number };
  const totalSpent = Math.round(totalRes.total * 100) / 100;
  const recentCount = totalRes.count;

  // Spending by category
  const catStmt = db.prepare(`
    SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM expenses
    WHERE spent_on LIKE ?
    GROUP BY category
    ORDER BY total DESC
  `);
  const catRows = catStmt.all(`${monthStr}%`) as Array<{ category: Category; total: number; count: number }>;

  const catMap = new Map<Category, { total: number; count: number }>();
  for (const r of catRows) {
    catMap.set(r.category, { total: r.total, count: r.count });
  }

  const categories: CategorySummary[] = Object.values(CATEGORY_MAP).map((meta) => {
    const data = catMap.get(meta.id) || { total: 0, count: 0 };
    const pct = totalSpent > 0 ? Math.round((data.total / totalSpent) * 1000) / 10 : 0;
    return {
      category: meta.id,
      label: meta.label,
      hindiLabel: meta.hindiLabel,
      icon: meta.icon,
      color: meta.color,
      total: Math.round(data.total * 100) / 100,
      percentage: pct,
      count: data.count,
    };
  }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  const remainingBudget = Math.max(0, Math.round((budget - totalSpent) * 100) / 100);
  const percentSpent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 1000) / 10) : 0;

  // Daily math (CODE, not LLM!)
  const daysElapsed = Math.max(1, dayOfMonth);
  const currentDailyPace = Math.round((totalSpent / daysElapsed) * 100) / 100;
  const safeDailyAllowance = Math.round((remainingBudget / daysRemaining) * 100) / 100;

  let runwayDate: string | null = null;
  let willLastMonth = true;

  if (currentDailyPace > 0) {
    const daysOfRunway = remainingBudget / currentDailyPace;
    if (daysOfRunway < daysRemaining) {
      willLastMonth = false;
      const exhausted = new Date(targetDate);
      exhausted.setDate(exhausted.getDate() + Math.floor(daysOfRunway));
      runwayDate = exhausted.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    }
  }

  const topCategory = categories.length > 0 ? categories[0] : null;

  return {
    month: monthStr,
    monthName,
    budget,
    totalSpent,
    remainingBudget,
    percentSpent,
    daysInMonth,
    dayOfMonth,
    daysRemaining,
    currentDailyPace,
    safeDailyAllowance,
    runwayDate,
    willLastMonth,
    topCategory,
    categories,
    recentCount,
  };
}
