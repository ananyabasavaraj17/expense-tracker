export const STORAGE_KEYS = {
  EXPENSES: 'expense-tracker:expenses',
  CATEGORIES: 'expense-tracker:categories',
  PROFILE_NAME: 'expense-tracker:profile-name',
  MONTHLY_INCOME: 'expense-tracker:monthly-income',
  MONTHLY_BUDGET: 'expense-tracker:monthly-budget',
  GOALS: 'expense-tracker:goals',
};

export const DEFAULT_CATEGORIES = [
  { id: 'cat-food', name: 'Food', color: '#d97706' },
  { id: 'cat-transport', name: 'Transport', color: '#0284c7' },
  { id: 'cat-bills', name: 'Bills', color: '#4f46e5' },
  { id: 'cat-shopping', name: 'Shopping', color: '#db2777' },
  { id: 'cat-entertainment', name: 'Entertainment', color: '#9333ea' },
  { id: 'cat-other', name: 'Other', color: '#475569' },
];

const LEGACY_CATEGORY_NAME_MAP = {
  'food & dining': 'cat-food',
  transportation: 'cat-transport',
  'housing & utilities': 'cat-bills',
  healthcare: 'cat-other',
};

/**
 * Generates a unique ID with a given prefix.
 *
 * @param {string} prefix
 * @returns {string}
 */
export function createUniqueId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Validates that a value is a non-empty array of valid category objects.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidCategoriesArray(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        item.id.trim() !== '' &&
        typeof item.name === 'string' &&
        item.name.trim() !== '' &&
        typeof item.color === 'string' &&
        /^#[0-9a-fA-F]{6}$/.test(item.color),
    )
  );
}

/**
 * Validates that a value is an array of transaction/expense objects.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidExpensesArray(value) {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.amount === 'number' &&
        typeof item.date === 'string' &&
        (item.type === 'income' ||
          typeof item.categoryId === 'string' ||
          typeof item.category === 'string'),
    )
  );
}

/**
 * Validates that a value is an array of savings goal objects.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidGoalsArray(value) {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        item.name.trim() !== '' &&
        typeof item.targetAmount === 'number' &&
        item.targetAmount > 0 &&
        typeof item.savedAmount === 'number' &&
        item.savedAmount >= 0,
    )
  );
}

/**
 * Normalizes legacy expenses that stored category names into categoryId references,
 * and sets default type to 'expense' if not explicitly 'income'.
 *
 * @param {Array<Object>} rawExpenses
 * @param {Array<{ id: string, name: string, color: string }>} categories
 * @returns {Array<{ id: string, amount: number, categoryId: string, date: string, note: string, type: 'expense' | 'income' }>}
 */
export function normalizeExpenses(rawExpenses, categories) {
  if (!Array.isArray(rawExpenses)) return [];

  const categoryIds = new Set(categories.map((cat) => cat.id));
  const categoryByName = new Map(
    categories.map((cat) => [cat.name.trim().toLowerCase(), cat.id]),
  );
  const fallbackCategoryId = categories[categories.length - 1]?.id || 'cat-other';

  return rawExpenses.map((expense) => {
    const rawRef = expense.categoryId || expense.category || '';
    let resolvedCategoryId = fallbackCategoryId;

    if (categoryIds.has(rawRef)) {
      resolvedCategoryId = rawRef;
    } else if (typeof rawRef === 'string') {
      const normalizedName = rawRef.trim().toLowerCase();
      if (categoryByName.has(normalizedName)) {
        resolvedCategoryId = categoryByName.get(normalizedName);
      } else if (
        LEGACY_CATEGORY_NAME_MAP[normalizedName] &&
        categoryIds.has(LEGACY_CATEGORY_NAME_MAP[normalizedName])
      ) {
        resolvedCategoryId = LEGACY_CATEGORY_NAME_MAP[normalizedName];
      }
    }

    return {
      id: expense.id,
      amount: Number(expense.amount),
      categoryId: resolvedCategoryId,
      date: expense.date,
      note: typeof expense.note === 'string' ? expense.note : '',
      type: expense.type === 'income' ? 'income' : 'expense',
    };
  });
}
