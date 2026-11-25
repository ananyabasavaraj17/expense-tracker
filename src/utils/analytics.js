/**
 * Formats a YYYY-MM key from local year and 0-based month index.
 *
 * @param {number} year
 * @param {number} monthIndex - 0-11
 * @returns {string}
 */
export function formatMonthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

/**
 * Formats a YYYY-MM key into a human-readable month label (e.g. "Nov 2026").
 *
 * @param {string} monthKey
 * @returns {string}
 */
export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return monthKey;
  const dateObj = new Date(year, month - 1, 1);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calculates current-month total, previous-month total, and safe percentage change.
 *
 * @param {Array<{ amount: number, date: string }>} expenses
 * @param {Date} [referenceDate=new Date()]
 * @returns {{
 *   currentMonthKey: string,
 *   currentMonthLabel: string,
 *   currentTotal: number,
 *   previousTotal: number,
 *   percentChange: number | null,
 *   trend: 'up' | 'down' | 'neutral',
 *   statusText: string
 * }}
 */
export function calculateMonthlySummary(expenses, referenceDate = new Date()) {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();
  const currentMonthKey = formatMonthKey(currentYear, currentMonth);

  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthKey = formatMonthKey(prevDate.getFullYear(), prevDate.getMonth());

  let currentTotal = 0;
  let previousTotal = 0;
  let currentIncome = 0;
  let previousIncome = 0;

  for (const expense of expenses) {
    if (typeof expense.date !== 'string') continue;
    const isIncome = expense.type === 'income';
    const amount = Number(expense.amount) || 0;

    if (expense.date.startsWith(currentMonthKey)) {
      if (isIncome) {
        currentIncome += amount;
      } else {
        currentTotal += amount;
      }
    } else if (expense.date.startsWith(prevMonthKey)) {
      if (isIncome) {
        previousIncome += amount;
      } else {
        previousTotal += amount;
      }
    }
  }

  let percentChange = null;
  let trend = 'neutral';
  let statusText = 'No change';

  if (previousTotal === 0 && currentTotal === 0) {
    percentChange = 0;
    trend = 'neutral';
    statusText = 'No change';
  } else if (previousTotal === 0 && currentTotal > 0) {
    percentChange = null;
    trend = 'up';
    statusText = 'No spending last month';
  } else {
    const rawPercent = ((currentTotal - previousTotal) / previousTotal) * 100;
    percentChange = Math.round(rawPercent * 10) / 10;

    if (percentChange > 0) {
      trend = 'up';
      statusText = `+${percentChange.toFixed(1)}% vs last month`;
    } else if (percentChange < 0) {
      trend = 'down';
      statusText = `${percentChange.toFixed(1)}% vs last month`;
    } else {
      trend = 'neutral';
      statusText = 'No change';
    }
  }

  return {
    currentMonthKey,
    currentMonthLabel: formatMonthLabel(currentMonthKey),
    currentTotal,
    previousTotal,
    currentIncome,
    previousIncome,
    percentChange,
    trend,
    statusText,
  };
}

/**
 * Returns selectable month options (last 6 months plus any month present in expenses),
 * sorted newest-first.
 *
 * @param {Array<{ date: string }>} expenses
 * @param {Date} [referenceDate=new Date()]
 * @returns {Array<{ key: string, label: string }>}
 */
export function getAvailableMonths(expenses, referenceDate = new Date()) {
  const monthKeys = new Set();
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  for (let i = 0; i < 6; i += 1) {
    const d = new Date(year, month - i, 1);
    monthKeys.add(formatMonthKey(d.getFullYear(), d.getMonth()));
  }

  for (const expense of expenses) {
    if (typeof expense.date === 'string' && /^\d{4}-\d{2}/.test(expense.date)) {
      monthKeys.add(expense.date.slice(0, 7));
    }
  }

  return Array.from(monthKeys)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({
      key,
      label: formatMonthLabel(key),
    }));
}

/**
 * Groups expenses for a given month by category and returns totals with category colors.
 *
 * @param {Array<{ amount: number, categoryId: string, date: string }>} expenses
 * @param {Array<{ id: string, name: string, color: string }>} categories
 * @param {string} monthKey - YYYY-MM
 * @returns {Array<{ id: string, name: string, color: string, total: number }>}
 */
export function calculateCategoryBreakdown(expenses, categories, monthKey) {
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
  const totalsByCategory = new Map();

  for (const expense of expenses) {
    if (expense.type === 'income') continue;
    if (typeof expense.date !== 'string' || !expense.date.startsWith(monthKey)) {
      continue;
    }
    const catId = expense.categoryId || 'cat-other';
    const prev = totalsByCategory.get(catId) || 0;
    totalsByCategory.set(catId, prev + (Number(expense.amount) || 0));
  }

  const result = [];
  for (const [catId, total] of totalsByCategory.entries()) {
    if (total <= 0) continue;
    const cat = categoryMap.get(catId) || {
      id: catId,
      name: 'Other',
      color: '#475569',
    };
    result.push({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      total: Number(total.toFixed(2)),
    });
  }

  return result.sort((a, b) => b.total - a.total);
}

/**
 * Calculates total spending for the last N months (default 6) in chronological order,
 * including months with zero spending.
 *
 * @param {Array<{ amount: number, date: string }>} expenses
 * @param {number} [monthsCount=6]
 * @param {Date} [referenceDate=new Date()]
 * @returns {Array<{ key: string, label: string, total: number }>}
 */
export function calculateMonthlyTrend(
  expenses,
  monthsCount = 6,
  referenceDate = new Date(),
) {
  const buckets = [];
  const totalsMap = new Map();
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  for (let i = monthsCount - 1; i >= 0; i -= 1) {
    const d = new Date(year, month - i, 1);
    const key = formatMonthKey(d.getFullYear(), d.getMonth());
    totalsMap.set(key, 0);
    buckets.push({
      key,
      label: formatMonthLabel(key),
      total: 0,
    });
  }

  for (const expense of expenses) {
    if (expense.type === 'income') continue;
    if (typeof expense.date !== 'string' || expense.date.length < 7) continue;
    const key = expense.date.slice(0, 7);
    if (totalsMap.has(key)) {
      totalsMap.set(key, totalsMap.get(key) + (Number(expense.amount) || 0));
    }
  }

  return buckets.map((bucket) => ({
    ...bucket,
    total: Number((totalsMap.get(bucket.key) || 0).toFixed(2)),
  }));
}
