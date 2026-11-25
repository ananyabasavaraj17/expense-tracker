import { useState } from 'react';
import './ProfileSettingsModal.css';

/**
 * Settings modal for editing Profile Name, Monthly Income, and Monthly Budget.
 */
function ProfileSettingsModal({
  profileName,
  monthlyIncome,
  monthlyBudget,
  onSave,
  onCancel,
}) {
  const [name, setName] = useState(profileName || '');
  const [income, setIncome] = useState(
    monthlyIncome !== null && monthlyIncome !== undefined && monthlyIncome !== ''
      ? String(monthlyIncome)
      : '',
  );
  const [budget, setBudget] = useState(
    monthlyBudget !== null && monthlyBudget !== undefined && monthlyBudget !== ''
      ? String(monthlyBudget)
      : '',
  );

  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Profile name cannot be empty.';
    }

    let parsedIncome = null;
    if (income.trim() !== '') {
      parsedIncome = Number(income);
      if (!Number.isFinite(parsedIncome) || parsedIncome < 0) {
        newErrors.income = 'Income must be a valid positive number or 0.';
      }
    }

    let parsedBudget = null;
    if (budget.trim() !== '') {
      parsedBudget = Number(budget);
      if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
        newErrors.budget = 'Budget must be a valid positive number or 0.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: trimmedName,
      income: parsedIncome,
      budget: parsedBudget,
    });
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="settings-name" className="form-label">
          Display Name <span className="form-required">*</span>
        </label>
        <input
          id="settings-name"
          type="text"
          className={`form-input ${errors.name ? 'form-input-error' : ''}`}
          placeholder="e.g. Ananya"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          maxLength={50}
        />
        {errors.name && (
          <p className="form-error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="settings-income" className="form-label">
          Monthly Income (₹)
        </label>
        <input
          id="settings-income"
          type="number"
          step="any"
          min="0"
          className={`form-input ${errors.income ? 'form-input-error' : ''}`}
          placeholder="e.g. 50000 (leave empty if not set)"
          value={income}
          onChange={(e) => {
            setIncome(e.target.value);
            if (errors.income) setErrors((prev) => ({ ...prev, income: '' }));
          }}
        />
        <span className="settings-field-hint">
          Used to calculate Total Balance and Savings Rate.
        </span>
        {errors.income && (
          <p className="form-error" role="alert">
            {errors.income}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="settings-budget" className="form-label">
          Monthly Budget (₹)
        </label>
        <input
          id="settings-budget"
          type="number"
          step="any"
          min="0"
          className={`form-input ${errors.budget ? 'form-input-error' : ''}`}
          placeholder="e.g. 35000 (leave empty if not set)"
          value={budget}
          onChange={(e) => {
            setBudget(e.target.value);
            if (errors.budget) setErrors((prev) => ({ ...prev, budget: '' }));
          }}
        />
        <span className="settings-field-hint">
          Track monthly spending progress against this target.
        </span>
        {errors.budget && (
          <p className="form-error" role="alert">
            {errors.budget}
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
          Save Settings
        </button>
      </div>
    </form>
  );
}

export default ProfileSettingsModal;
