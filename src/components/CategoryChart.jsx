import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  calculateCategoryBreakdown,
  getAvailableMonths,
} from '../utils/analytics';
import { formatINR } from '../utils/currency';
import './CategoryChart.css';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{entry.name}</p>
      <p className="chart-tooltip-value">{formatINR(entry.total)}</p>
    </div>
  );
}

function CategoryChart({ expenses, categories }) {
  const availableMonths = useMemo(() => getAvailableMonths(expenses), [expenses]);

  const [selectedMonth, setSelectedMonth] = useState(
    () => availableMonths[0]?.key || '',
  );

  const activeMonth = availableMonths.some((m) => m.key === selectedMonth)
    ? selectedMonth
    : availableMonths[0]?.key || '';

  const activeMonthLabel =
    availableMonths.find((m) => m.key === activeMonth)?.label || activeMonth;

  const breakdown = useMemo(
    () => calculateCategoryBreakdown(expenses, categories, activeMonth),
    [expenses, categories, activeMonth],
  );

  const monthTotal = breakdown.reduce((s, e) => s + e.total, 0);

  return (
    <article className="dash-card category-chart-card" aria-labelledby="category-chart-title">
      <div className="dash-card-header">
        <div>
          <h3 id="category-chart-title" className="dash-card-title">Category Breakdown</h3>
          <p className="dash-card-subtitle">By category</p>
        </div>
        <label htmlFor="category-month-select" className="sr-only">Select month</label>
        <select
          id="category-month-select"
          className="chart-month-select"
          value={activeMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {availableMonths.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </div>

      {breakdown.length === 0 ? (
        <div className="chart-empty-state">
          <svg className="chart-empty-icon" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="var(--color-border)" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M24 16v8l5 5" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="chart-empty-text">No expenses for {activeMonthLabel}</p>
        </div>
      ) : (
        <div className="category-chart-content">
          <div className="category-donut-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {breakdown.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="category-breakdown-legend" aria-label="Category totals">
            {breakdown.map((entry) => {
              const pct = monthTotal > 0
                ? Math.round((entry.total / monthTotal) * 100)
                : 0;
              return (
                <li key={entry.id} className="category-legend-item">
                  <span className="category-legend-left">
                    <span
                      className="category-legend-dot"
                      style={{ '--legend-color': entry.color }}
                      aria-hidden="true"
                    />
                    <span className="category-legend-name">{entry.name}</span>
                  </span>
                  <span className="category-legend-right">
                    <span className="category-legend-pct">{pct}%</span>
                    <span className="category-legend-value">{formatINR(entry.total)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}

export default CategoryChart;
