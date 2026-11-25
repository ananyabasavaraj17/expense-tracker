import { useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { calculateMonthlyTrend } from '../utils/analytics';
import { formatINR, formatINRCompact } from '../utils/currency';
import './TrendChart.css';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p className="chart-tooltip-value">{formatINR(payload[0].value)}</p>
    </div>
  );
}

function TrendChart({ expenses }) {
  const trendData = useMemo(() => calculateMonthlyTrend(expenses, 6), [expenses]);

  return (
    <article className="dash-card trend-card" aria-labelledby="trend-chart-title">
      <div className="dash-card-header">
        <div>
          <h3 id="trend-chart-title" className="dash-card-title">Spending Trend</h3>
          <p className="dash-card-subtitle">Last 6 months</p>
        </div>
      </div>

      <div className="trend-chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={trendData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--orange-500)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--orange-500)" stopOpacity={0.65} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatINRCompact}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249,115,22,.07)' }} />
            <Bar dataKey="total" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default TrendChart;
