import { useState } from 'react';
import { DEFAULT_CATEGORIES, createUniqueId } from '../constants/categories';
import './ExpenseForm.css';

const MAX_NOTE_LENGTH = 120;

/**
 * Returns today's local date formatted as YYYY-MM-DD for HTML date inputs.
 *
 * @returns {string}
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates expense/income form values and returns a map of field error messages.
 *
 * @param {{ amount: string, categoryId: string, date: string, note: string }} values
 * @param {'expense' | 'income'} type
 * @returns {Record<string, string>}
 */
function validateExpense(values, type = 'expense') {
  const errors = {};
  const parsedAmount = Number(values.amount);

  if (values.amount.trim() === '' || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    errors.amount = 'Amount must be greater than 0.';
  }

  if (type === 'expense' && !values.categoryId) {
    errors.categoryId = 'Category is required.';
  }

  if (!values.date) {
    errors.date = 'Date is required.';
  }

  if (values.note.length > MAX_NOTE_LENGTH) {
    errors.note = `Note must not exceed ${MAX_NOTE_LENGTH} characters.`;
  }

  return errors;
}

/**
 * Reusable transaction entry form with client-side validation.
 *
 * @param {Object} props
 * @param {Function} props.onSubmit - Called with `{ id, amount, categoryId, date, note, type }` when valid.
 * @param {Function} props.onCancel - Called when the user cancels entry.
 * @param {Array<{ id: string, name: string, color: string }>} [props.categories] - Selectable categories.
 */
function ExpenseForm({
  onSubmit,
  onCancel,
  categories = DEFAULT_CATEGORIES,
}) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(getTodayDateString);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  function clearFieldError(field) {
    if (!errors[field]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateExpense({ amount, categoryId, date, note }, type);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const fallbackCat = categories[categories.length - 1]?.id || 'cat-other';
    onSubmit({
      id: createUniqueId(type === 'income' ? 'inc' : 'exp'),
      amount: Number(Number(amount).toFixed(2)),
      categoryId: categoryId || fallbackCat,
      date,
      note: note.trim(),
      type,
    });
  }

  const isNoteOverLimit = note.length > MAX_NOTE_LENGTH;

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      {/* Type Toggle */}
      <div className="form-type-toggle" role="radiogroup" aria-label="Transaction Type">
        <button
          type="button"
          className={`form-type-btn ${type === 'expense' ? 'form-type-btn--active form-type-btn--expense' : ''}`}
          onClick={() => {
            setType('expense');
            clearFieldError('categoryId');
          }}
        >
          Expense
        </button>
        <button
          type="button"
          className={`form-type-btn ${type === 'income' ? 'form-type-btn--active form-type-btn--income' : ''}`}
          onClick={() => {
            setType('income');
            clearFieldError('categoryId');
          }}
        >
          Income
        </button>
      </div>
      <div className="form-field">
        <label htmlFor="expense-amount" className="form-label">
          Amount <span className="form-required">*</span>
        </label>
        <input
          id="expense-amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          className={`form-input ${errors.amount ? 'form-input-error' : ''}`}
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            clearFieldError('amount');
          }}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? 'expense-amount-error' : undefined}
        />
        {errors.amount && (
          <p id="expense-amount-error" className="form-error" role="alert">
            {errors.amount}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="expense-category" className="form-label">
          Category {type === 'expense' ? <span className="form-required">*</span> : <span className="form-char-count">(Optional)</span>}
        </label>
        <select
          id="expense-category"
          name="category"
          className={`form-input ${errors.categoryId ? 'form-input-error' : ''}`}
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            clearFieldError('categoryId');
          }}
          aria-invalid={Boolean(errors.categoryId)}
          aria-describedby={errors.categoryId ? 'expense-category-error' : undefined}
        >
          <option value="">{type === 'expense' ? 'Select a category' : 'Select a category (default: Other)'}</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p id="expense-category-error" className="form-error" role="alert">
            {errors.categoryId}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="expense-date" className="form-label">
          Date <span className="form-required">*</span>
        </label>
        <input
          id="expense-date"
          name="date"
          type="date"
          className={`form-input ${errors.date ? 'form-input-error' : ''}`}
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            clearFieldError('date');
          }}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? 'expense-date-error' : undefined}
        />
        {errors.date && (
          <p id="expense-date-error" className="form-error" role="alert">
            {errors.date}
          </p>
        )}
      </div>

      <div className="form-field">
        <div className="form-label-row">
          <label htmlFor="expense-note" className="form-label">
            Note
          </label>
          <span
            className={`form-char-count ${isNoteOverLimit ? 'form-char-count-error' : ''}`}
          >
            {note.length}/{MAX_NOTE_LENGTH}
          </span>
        </div>
        <input
          id="expense-note"
          name="note"
          type="text"
          placeholder="Optional description (max 120 characters)"
          className={`form-input ${errors.note ? 'form-input-error' : ''}`}
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            clearFieldError('note');
          }}
          aria-invalid={Boolean(errors.note)}
          aria-describedby={errors.note ? 'expense-note-error' : undefined}
        />
        {errors.note && (
          <p id="expense-note-error" className="form-error" role="alert">
            {errors.note}
          </p>
        )}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="form-btn form-btn-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button type="submit" className="form-btn form-btn-primary">
          {type === 'income' ? 'Save Income' : 'Save Expense'}
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;
