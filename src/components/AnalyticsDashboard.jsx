import { useState } from 'react';
import SummaryCard from './SummaryCard';
import MonthlyBudgetCard from './MonthlyBudgetCard';
import CategoryChart from './CategoryChart';
import TrendChart from './TrendChart';
import { downloadCsvFile, generateExpensesCsv } from '../utils/csvExport';
import './AnalyticsDashboard.css';

/**
 * Container section for:
 * - 4 Summary Cards (Total Balance, Income, Expenses, Savings Rate)
 * - Monthly Budget Progress Card
 * - Category Breakdown & 6-Month Spending Trend
 * - CSV Export
 */
function AnalyticsDashboard({
  expenses,
  categories,
  monthlyIncome,
  monthlyBudget,
  onOpenSettings,
}) {
  const [exportFeedback, setExportFeedback] = useState(null);

  function handleExportCsv() {
    if (expenses.length === 0) {
      setExportFeedback({
        type: 'info',
        message: 'No expenses to export yet. Add an expense first.',
      });
      return;
    }

    const csvContent = generateExpensesCsv(expenses, categories);
    downloadCsvFile(csvContent, 'expenses.csv');
    setExportFeedback({
      type: 'success',
      message: `Exported ${expenses.length} ${
        expenses.length === 1 ? 'expense' : 'expenses'
      } to expenses.csv.`,
    });
  }

  return (
    <section className="analytics-section" aria-labelledby="analytics-heading">
      <div className="analytics-header">
        <div className="analytics-header-text">
          <h2 id="analytics-heading" className="analytics-heading">
            RupeeWise Dashboard
          </h2>
          <p className="analytics-subheading">
            Track your balance, monthly budget, spending habits, and trends.
          </p>
        </div>

        <button
          type="button"
          className="export-csv-btn"
          onClick={handleExportCsv}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Export CSV</span>
        </button>
      </div>

      {exportFeedback && (
        <div
          className={`export-feedback export-feedback--${exportFeedback.type}`}
          role="status"
          aria-live="polite"
        >
          {exportFeedback.message}
        </div>
      )}

      {/* 4 Summary Cards: Balance, Income, Expenses, Savings Rate */}
      <SummaryCard
        expenses={expenses}
        monthlyIncome={monthlyIncome}
        onOpenSettings={onOpenSettings}
      />

      {/* Main Grid: Budget Card + Category Chart, followed by Full-width Trend Chart */}
      <div className="analytics-grid">
        <MonthlyBudgetCard
          expenses={expenses}
          monthlyBudget={monthlyBudget}
          onOpenSettings={onOpenSettings}
        />
        <CategoryChart expenses={expenses} categories={categories} />
        <div className="analytics-trend-span">
          <TrendChart expenses={expenses} />
        </div>
      </div>
    </section>
  );
}

export default AnalyticsDashboard;
