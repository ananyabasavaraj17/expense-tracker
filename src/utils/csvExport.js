/**
 * Escapes a single CSV field value per RFC 4180 (quotes fields containing commas,
 * double quotes, or line breaks, and doubles internal quotes).
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeCsvField(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a CSV string for all expenses with resolved category names.
 *
 * @param {Array<{ id: string, amount: number, categoryId: string, date: string, note: string }>} expenses
 * @param {Array<{ id: string, name: string }>} categories
 * @returns {string}
 */
export function generateExpensesCsv(expenses, categories) {
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));
  const headers = ['ID', 'Type', 'Amount', 'Category', 'Date', 'Note'];

  const rows = expenses.map((expense) => {
    const isIncome = expense.type === 'income';
    const categoryName = isIncome ? 'Income' : (categoryMap.get(expense.categoryId) || 'Other');
    const fields = [
      expense.id,
      isIncome ? 'Income' : 'Expense',
      Number(expense.amount).toFixed(2),
      categoryName,
      expense.date,
      expense.note || '',
    ];
    return fields.map(escapeCsvField).join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a browser download for a CSV string.
 *
 * @param {string} csvContent
 * @param {string} [filename='expenses.csv']
 */
export function downloadCsvFile(csvContent, filename = 'expenses.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
