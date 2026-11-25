import { useMemo } from 'react';
import { calculateMonthlySummary } from '../utils/analytics';
import { formatINR } from '../utils/currency';
import './MonthlyBudgetCard.css';

/**
 * Monthly Budget card showing budget, spent, remaining, and progress bar with warnings.
 */
function MonthlyBudgetCard({ expenses, monthlyBudget, onOpenSettings }) {
  const summary = useMemo(() => calculateMonthlySummary(expenses), [expenses]);
  const spent = summary.currentTotal;

  const hasBudget = typeof monthlyBudget === 'number' && Number.isFinite(monthlyBudget) && monthlyBudget > 0;
  const budget = hasBudget ? monthlyBudget : 0;
  const remaining = budget - spent;
  const percentage = hasBudget ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const isOverBudget = hasBudget && spent > budget;
  const isNearBudget = hasBudget && !isOverBudget && percentage >= 85;

  return (
    <article className="dash-card budget-card" aria-labelledby="budget-card-title">
      <div className="dash-card-header">
        <div>
          <h3 id="budget-card-title" className="dash-card-title">Monthly Budget</h3>
          <p className="dash-card-subtitle">{summary.currentMonthLabel} target</p>
        </div>

        {hasBudget ? (
          <button
            type="button"
            className="budget-edit-btn"
            onClick={onOpenSettings}
            title="Edit Budget"
          >
            Edit
          </button>
        ) : null}
      </div>

      {!hasBudget ? (
        <div className="budget-empty-state">
          <div className="budget-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <p className="budget-empty-text">No budget set for this month</p>
          <button
            type="button"
            className="budget-set-btn"
            onClick={onOpenSettings}
          >
            Set monthly budget
          </button>
        </div>
      ) : (
        <div className="budget-content">
          <div className="budget-metric-row">
            <div className="budget-metric">
              <span className="budget-metric-label">Budget</span>
              <span className="budget-metric-val">{formatINR(budget)}</span>
            </div>
            <div className="budget-metric">
              <span className="budget-metric-label">Spent</span>
              <span className="budget-metric-val budget-metric--spent">{formatINR(spent)}</span>
            </div>
            <div className="budget-metric">
              <span className="budget-metric-label">{remaining >= 0 ? 'Remaining' : 'Over by'}</span>
              <span className={`budget-metric-val ${remaining >= 0 ? 'budget-metric--rem' : 'budget-metric--over'}`}>
                {formatINR(Math.abs(remaining))}
              </span>
            </div>
          </div>

          <div className="budget-progress-container">
            <div className="budget-progress-labels">
              <span className="budget-progress-pct">{percentage}% used</span>
              <span className="budget-progress-sub">
                {isOverBudget
                  ? 'Budget exceeded!'
                  : `${formatINR(remaining)} left`}
              </span>
            </div>
            <div className="budget-progress-track">
              <div
                className={`budget-progress-bar ${isOverBudget ? 'bar--danger' : isNearBudget ? 'bar--warn' : 'bar--normal'}`}
                style={{ width: `${Math.min((spent / budget) * 100, 100)}%` }}
              />
            </div>
          </div>

          {isOverBudget && (
            <div className="budget-alert budget-alert--danger" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Spending has exceeded your budget by {formatINR(Math.abs(remaining))}.</span>
            </div>
          )}

          {isNearBudget && (
            <div className="budget-alert budget-alert--warn" role="status">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>You have utilized {percentage}% of your monthly budget.</span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default MonthlyBudgetCard;
