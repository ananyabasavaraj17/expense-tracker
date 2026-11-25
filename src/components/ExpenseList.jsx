import { useState } from 'react';
import CategoryTag from './CategoryTag';
import { formatINR } from '../utils/currency';
import './ExpenseList.css';

function formatExpenseDate(dateString) {
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return dateString;
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatExpenseDateShort(dateString) {
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return dateString;
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/**
 * Transactions list with type filtering (All / Expenses / Income),
 * sorting newest-first, and delete action.
 */
function ExpenseList({
  expenses,
  categories,
  onDeleteExpense,
  title = 'Recent Transactions',
  limit,
  onViewAll,
  showFilters = true,
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income'
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  const filtered = expenses.filter((item) => {
    if (filterType === 'all') return true;
    const itemType = item.type === 'income' ? 'income' : 'expense';
    return itemType === filterType;
  });

  const sortedExpenses = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const displayedExpenses = typeof limit === 'number' ? sortedExpenses.slice(0, limit) : sortedExpenses;

  return (
    <section className="dash-card transactions-card" aria-labelledby="transactions-heading">
      <div className="dash-card-header">
        <div>
          <h2 id="transactions-heading" className="dash-card-title">{title}</h2>
          <p className="dash-card-subtitle">
            {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'} total
            {filterType !== 'all' && ` (${displayedExpenses.length} ${filterType}s shown)`}
          </p>
        </div>

        {onViewAll && expenses.length > (limit || 0) && (
          <button
            type="button"
            className="transactions-view-all-btn"
            onClick={onViewAll}
          >
            View All ({expenses.length})
          </button>
        )}
      </div>

      {showFilters && expenses.length > 0 && (
        <div className="transaction-filter-bar">
          <div className="filter-tabs" role="tablist" aria-label="Transaction type filter">
            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'all'}
              className={`filter-tab-btn ${filterType === 'all' ? 'filter-tab-btn--active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'expense'}
              className={`filter-tab-btn ${filterType === 'expense' ? 'filter-tab-btn--active' : ''}`}
              onClick={() => setFilterType('expense')}
            >
              Expenses
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'income'}
              className={`filter-tab-btn ${filterType === 'income' ? 'filter-tab-btn--active' : ''}`}
              onClick={() => setFilterType('income')}
            >
              Income
            </button>
          </div>
        </div>
      )}

      {displayedExpenses.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem 1rem' }}>
          <p className="empty-state-text">No transactions matching your selection.</p>
        </div>
      ) : (
        <div className="transaction-list">
          {displayedExpenses.map((expense) => {
            const isIncome = expense.type === 'income';
            const category = categoryMap.get(expense.categoryId) || {
              name: isIncome ? 'Income' : 'Other',
              color: isIncome ? '#10b981' : '#64748b',
            };

            return (
              <div key={expense.id} className="transaction-row">
                {/* Type & Color icon */}
                <div
                  className="transaction-icon"
                  style={{ '--tx-color': isIncome ? '#10b981' : category.color }}
                  aria-hidden="true"
                >
                  {isIncome ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4l3 3" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="transaction-info">
                  <span className="transaction-note">
                    {expense.note || (isIncome ? 'Income' : category.name)}
                  </span>
                  <span className="transaction-meta">
                    <span
                      className={`transaction-type-badge transaction-type-badge--${isIncome ? 'income' : 'expense'}`}
                    >
                      {isIncome ? 'Income' : 'Expense'}
                    </span>
                    {!isIncome && (
                      <CategoryTag name={category.name} color={category.color} />
                    )}
                    <span className="transaction-date">
                      <time dateTime={expense.date}>{formatExpenseDateShort(expense.date)}</time>
                    </span>
                  </span>
                </div>

                {/* Amount + delete */}
                <div className="transaction-right">
                  <span
                    className={`transaction-amount ${isIncome ? 'transaction-amount--income' : ''}`}
                  >
                    {isIncome ? `+${formatINR(expense.amount)}` : `-${formatINR(expense.amount)}`}
                  </span>
                  <button
                    type="button"
                    className="transaction-delete-btn"
                    onClick={() => onDeleteExpense(expense)}
                    aria-label={`Delete ${category.name} ${isIncome ? 'income' : 'expense'} of ${formatINR(expense.amount)} on ${formatExpenseDate(expense.date)}`}
                    title="Delete"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 0 0 0-2h-3.382l-.724-1.447A1 1 0 0 0 11 2H9zm-1 6a1 1 0 0 1 2 0v5a1 1 0 1 1-2 0V8zm4 0a1 1 0 0 1 2 0v5a1 1 0 1 1-2 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ExpenseList;
