import { useMemo } from 'react';
import { calculateCategoryBreakdown, calculateMonthlySummary } from '../utils/analytics';
import { formatINR } from '../utils/currency';
import './InsightsCard.css';

/**
 * Personal financial insights card for the RupeeWise dashboard.
 *
 * @param {Object} props
 * @param {Array<Object>} props.expenses
 * @param {Array<Object>} props.categories
 * @param {number|null} props.monthlyIncome
 * @param {number|null} props.monthlyBudget
 */
function InsightsCard({ expenses, categories, monthlyIncome, monthlyBudget }) {
  const summary = useMemo(() => calculateMonthlySummary(expenses), [expenses]);
  const categoryBreakdown = useMemo(
    () => calculateCategoryBreakdown(expenses, categories, summary.currentMonthKey),
    [expenses, categories, summary.currentMonthKey],
  );

  const topCategory = categoryBreakdown[0] || null;
  const currentExpenses = summary.currentTotal;
  const currentIncomeTxn = summary.currentIncome || 0;
  const hasConfigIncome = typeof monthlyIncome === 'number' && Number.isFinite(monthlyIncome);
  const effectiveIncome = currentIncomeTxn > 0
    ? (hasConfigIncome ? Math.max(monthlyIncome, currentIncomeTxn) : currentIncomeTxn)
    : (hasConfigIncome ? monthlyIncome : 0);

  const hasBudget = typeof monthlyBudget === 'number' && Number.isFinite(monthlyBudget) && monthlyBudget > 0;

  // Compute insights
  const insights = useMemo(() => {
    const list = [];

    // 1. Top Category insight
    if (topCategory && currentExpenses > 0) {
      const catPercent = Math.round((topCategory.total / currentExpenses) * 100);
      list.push({
        id: 'top-cat',
        type: 'blue',
        title: 'Top Category',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
        text: (
          <>
            <strong>{topCategory.name}</strong> accounts for <strong>{catPercent}%</strong> of your {summary.currentMonthLabel} spending ({formatINR(topCategory.total)}).
          </>
        ),
      });
    }

    // 2. Budget Health insight
    if (hasBudget) {
      const remaining = monthlyBudget - currentExpenses;
      const pct = Math.round((currentExpenses / monthlyBudget) * 100);
      if (currentExpenses > monthlyBudget) {
        list.push({
          id: 'budget-over',
          type: 'red',
          title: 'Budget Alert',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
          text: (
            <>
              You have exceeded your monthly budget by <strong>{formatINR(Math.abs(remaining))}</strong> ({pct}% utilized).
            </>
          ),
        });
      } else {
        list.push({
          id: 'budget-healthy',
          type: 'green',
          title: 'Budget Health',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ),
          text: (
            <>
              You have <strong>{formatINR(remaining)}</strong> remaining of your {formatINR(monthlyBudget)} budget ({100 - pct}% left).
            </>
          ),
        });
      }
    } else {
      list.push({
        id: 'budget-unset',
        type: 'orange',
        title: 'Budget Tip',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        ),
        text: 'Configure a monthly budget in Settings to monitor spending targets and pace.',
      });
    }

    // 3. Savings / Cash Flow insight
    if (effectiveIncome > 0) {
      const netSavings = effectiveIncome - currentExpenses;
      const rate = ((netSavings / effectiveIncome) * 100).toFixed(1);
      if (netSavings >= 0) {
        list.push({
          id: 'savings-good',
          type: 'green',
          title: 'Savings Pace',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          ),
          text: (
            <>
              Savings rate is <strong>{rate}%</strong>. You are on track to preserve <strong>{formatINR(netSavings)}</strong> this month.
            </>
          ),
        });
      } else {
        list.push({
          id: 'savings-deficit',
          type: 'red',
          title: 'Cash Flow Notice',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          ),
          text: (
            <>
              Spending exceeds monthly income by <strong>{formatINR(Math.abs(netSavings))}</strong> this month.
            </>
          ),
        });
      }
    } else {
      list.push({
        id: 'income-unset',
        type: 'blue',
        title: 'Income Tracking',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="16 12 12 8 8 12" />
            <line x1="12" y1="16" x2="12" y2="8" />
          </svg>
        ),
        text: 'Add income transactions or configure monthly salary to calculate your real savings rate.',
      });
    }

    return list;
  }, [topCategory, currentExpenses, summary.currentMonthLabel, hasBudget, monthlyBudget, effectiveIncome]);

  return (
    <article className="insights-card" aria-labelledby="insights-title">
      <div className="insights-header">
        <div className="insights-icon-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div>
          <h3 id="insights-title" className="insights-title">Personal Financial Insights</h3>
          <p className="insights-subtitle">
            Smart, data-driven observations based on your real activity
          </p>
        </div>
      </div>

      <div className="insights-list">
        {insights.map((item) => (
          <div key={item.id} className="insight-item">
            <div className={`insight-item-icon insight-item-icon--${item.type}`} aria-hidden="true">
              {item.icon}
            </div>
            <div className="insight-item-body">
              <div className="insight-item-title">{item.title}</div>
              <p className="insight-item-text">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default InsightsCard;
