/**
 * Indian Rupee currency formatter using the en-IN locale.
 * Formats values such as ₹1,000 / ₹12,500 / ₹1,25,000.
 */
export const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Formats a numeric amount as an Indian Rupee string.
 *
 * @param {number} amount
 * @returns {string}  e.g. "₹1,25,000"
 */
export function formatINR(amount) {
  return INR_FORMATTER.format(Number(amount) || 0);
}

/**
 * Compact formatter for axis tick labels — shows ₹1K, ₹1.2L etc.
 *
 * @param {number} value
 * @returns {string}
 */
export function formatINRCompact(value) {
  const num = Number(value) || 0;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
  return `₹${num}`;
}
