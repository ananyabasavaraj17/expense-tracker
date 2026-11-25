import { useMemo } from 'react';
import { calculateMonthlySummary } from '../utils/analytics';
import { formatINR } from '../utils/currency';
import './SummaryCard.css';

const TREND_UP_ICON = (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12.293 3.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1-1.414 1.414L13 5.414V17a1 1 0 1 1-2 0V5.414L7.707 8.707a1 1 0 0 1-1.414-1.414l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const TREND_DOWN_ICON = (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M7.707 16.707a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L7 14.586V3a1 1 0 1 1 2 0v11.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Top dashboard 4-card summary:
 * 1. Total Balance = Monthly Income - Monthly Expenses
 * 2. Monthly Income
 * 3. Monthly Expenses
 * 4. Savings Rate = (Savings / Income) * 100
 */
function SummaryCard({ expenses, monthlyIncome, onOpenSettings }) {
  const summary = useMemo(() => calculateMonthlySummary(expenses), [expenses]);
  const currentMonthExpenses = summary.currentTotal;
  const transactionIncome = summary.currentIncome || 0;

  const hasConfigIncome = typeof monthlyIncome === 'number' && Number.isFinite(monthlyIncome);
  const hasIncome = hasConfigIncome || transactionIncome > 0;
  
  const incomeVal = transactionIncome > 0
    ? (hasConfigIncome ? Math.max(monthlyIncome, transactionIncome) : transactionIncome)
    : (hasConfigIncome ? monthlyIncome : 0);

  // Total Balance
  const totalBalance = hasIncome ? incomeVal - currentMonthExpenses : null;

  // Savings and Savings Rate
  const savings = hasIncome ? incomeVal - currentMonthExpenses : null;
  let savingsRate = null;
  if (hasIncome) {
    if (incomeVal > 0) {
      savingsRate = (savings / incomeVal) * 100;
    } else if (incomeVal === 0 && currentMonthExpenses === 0) {
      savingsRate = 0;
    } else {
      savingsRate = -100;
    }
  }

  return (
    <div className="stats-bar">
      {/* 1. Total Balance */}
      <article className="stat-card stat-card--accent" aria-labelledby="stat-balance-title">
        <div className="stat-card-icon stat-icon--orange" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <div className="stat-card-body">
          <span id="stat-balance-title" className="stat-card-label">
            Total Balance
          </span>
          {hasIncome ? (
            <span
              className={`stat-card-value ${totalBalance < 0 ? 'stat-value--negative' : ''}`}
              data-testid="summary-total-balance"
            >
              {formatINR(totalBalance)}
            </span>
          ) : (
            <button
              type="button"
              className="stat-card-action-btn"
              onClick={onOpenSettings}
            >
              Set monthly income
            </button>
          )}
          <span className="stat-card-sub">
            {hasIncome ? `Income - ${summary.currentMonthLabel} Expenses` : 'Required for balance'}
          </span>
        </div>
      </article>

      {/* 2. Monthly Income */}
      <article className="stat-card" aria-labelledby="stat-income-title">
        <div className="stat-card-icon stat-icon--green" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="16 12 12 8 8 12" />
            <line x1="12" y1="16" x2="12" y2="8" />
          </svg>
        </div>
        <div className="stat-card-body">
          <span id="stat-income-title" className="stat-card-label">Monthly Income</span>
          {hasIncome ? (
            <div className="stat-value-row">
              <span className="stat-card-value">{formatINR(incomeVal)}</span>
              <button
                type="button"
                className="stat-edit-link"
                onClick={onOpenSettings}
                title="Edit Income"
              >
                Edit
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="stat-card-action-btn"
              onClick={onOpenSettings}
            >
              Set monthly income
            </button>
          )}
          <span className="stat-card-sub">
            {transactionIncome > 0
              ? `${formatINR(transactionIncome)} from transactions`
              : (hasConfigIncome ? 'Monthly recurring' : 'Click to configure')}
          </span>
        </div>
      </article>

      {/* 3. Monthly Expenses */}
      <article className="stat-card" aria-labelledby="stat-expenses-title">
        <div className="stat-card-icon stat-icon--red" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <div className="stat-card-body">
          <span id="stat-expenses-title" className="stat-card-label">
            {summary.currentMonthLabel} Expenses
          </span>
          <span className="stat-card-value" data-testid="summary-current-total">
            {formatINR(summary.currentTotal)}
          </span>
          <span
            className={`stat-card-badge stat-badge--${summary.trend}`}
            data-testid="summary-change-badge"
          >
            {summary.trend === 'up' && TREND_UP_ICON}
            {summary.trend === 'down' && TREND_DOWN_ICON}
            {summary.statusText}
          </span>
        </div>
      </article>

      {/* 4. Savings Rate */}
      <article className="stat-card" aria-labelledby="stat-savings-title">
        <div className="stat-card-icon stat-icon--purple" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="stat-card-body">
          <span id="stat-savings-title" className="stat-card-label">Savings Rate</span>
          {hasIncome ? (
            <div className="stat-value-row">
              <span
                className={`stat-card-value ${savingsRate < 0 ? 'stat-value--danger' : ''}`}
                data-testid="summary-savings-rate"
              >
                {savingsRate.toFixed(1)}%
              </span>
              <span
                className={`stat-pill-badge ${savingsRate >= 20 ? 'stat-pill--good' : savingsRate >= 0 ? 'stat-pill--warn' : 'stat-pill--alert'}`}
              >
                {savingsRate >= 0 ? `${formatINR(savings)} saved` : `${formatINR(Math.abs(savings))} deficit`}
              </span>
            </div>
          ) : (
            <p className="stat-card-prompt-text">
              Add income to calculate savings rate
            </p>
          )}
          <span className="stat-card-sub">
            {hasIncome ? `(Savings / Income) × 100` : 'Awaiting income figure'}
          </span>
        </div>
      </article>
    </div>
  );
}

export default SummaryCard;
