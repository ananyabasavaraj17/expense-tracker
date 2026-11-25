import { useState } from 'react';
import Modal from './Modal';
import { createUniqueId } from '../constants/categories';
import { formatINR } from '../utils/currency';
import './GoalsSection.css';

/**
 * Savings Goals manager section with CRUD and quick deposit.
 *
 * @param {Object} props
 * @param {Array<{ id: string, name: string, targetAmount: number, savedAmount: number, targetDate?: string }>} props.goals
 * @param {Function} props.onAddGoal
 * @param {Function} props.onUpdateGoal
 * @param {Function} props.onDeleteGoal
 */
function GoalsSection({ goals = [], onAddGoal, onUpdateGoal, onDeleteGoal }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [depositGoal, setDepositGoal] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formSaved, setFormSaved] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formError, setFormError] = useState('');

  // Deposit input
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');

  // Overall calculations
  const totalTarget = goals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (Number(g.savedAmount) || 0), 0);
  const overallPercentage = totalTarget > 0 ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100) : 0;
  const completedGoalsCount = goals.filter((g) => g.savedAmount >= g.targetAmount).length;

  function openAddModal() {
    setFormName('');
    setFormTarget('');
    setFormSaved('0');
    setFormDate('');
    setFormError('');
    setIsAddModalOpen(true);
  }

  function openEditModal(goal) {
    setEditingGoal(goal);
    setFormName(goal.name);
    setFormTarget(String(goal.targetAmount));
    setFormSaved(String(goal.savedAmount));
    setFormDate(goal.targetDate || '');
    setFormError('');
  }

  function handleSaveGoal(e) {
    e.preventDefault();
    const parsedTarget = Number(formTarget);
    const parsedSaved = Number(formSaved || '0');

    if (!formName.trim()) {
      setFormError('Goal name is required.');
      return;
    }
    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      setFormError('Target amount must be greater than 0.');
      return;
    }
    if (!Number.isFinite(parsedSaved) || parsedSaved < 0) {
      setFormError('Saved amount cannot be negative.');
      return;
    }

    if (editingGoal) {
      onUpdateGoal({
        ...editingGoal,
        name: formName.trim(),
        targetAmount: parsedTarget,
        savedAmount: parsedSaved,
        targetDate: formDate || undefined,
      });
      setEditingGoal(null);
    } else {
      onAddGoal({
        id: createUniqueId('goal'),
        name: formName.trim(),
        targetAmount: parsedTarget,
        savedAmount: parsedSaved,
        targetDate: formDate || undefined,
      });
      setIsAddModalOpen(false);
    }
  }

  function openDepositModal(goal) {
    setDepositGoal(goal);
    setDepositAmount('');
    setDepositError('');
  }

  function handleDepositSubmit(e) {
    e.preventDefault();
    const addVal = Number(depositAmount);
    if (!Number.isFinite(addVal) || addVal <= 0) {
      setDepositError('Deposit amount must be greater than 0.');
      return;
    }

    onUpdateGoal({
      ...depositGoal,
      savedAmount: Number((depositGoal.savedAmount + addVal).toFixed(2)),
    });
    setDepositGoal(null);
  }

  return (
    <div className="goals-section">
      <div className="goals-header">
        <div>
          <h2 className="goals-title">Savings Goals</h2>
          <p className="goals-subtitle">
            Plan, track, and achieve your financial milestones with RupeeWise.
          </p>
        </div>
        <button
          type="button"
          className="goals-add-btn"
          onClick={openAddModal}
        >
          <span aria-hidden="true">+</span>
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Overview stats bar */}
      <div className="goals-summary-card">
        <div className="goals-summary-stats">
          <div className="goals-stat-item">
            <span className="goals-stat-label">Total Saved</span>
            <span className="goals-stat-val goals-stat-val--success">
              {formatINR(totalSaved)}
            </span>
          </div>
          <div className="goals-stat-item">
            <span className="goals-stat-label">Total Target</span>
            <span className="goals-stat-val">
              {formatINR(totalTarget)}
            </span>
          </div>
          <div className="goals-stat-item">
            <span className="goals-stat-label">Overall Progress</span>
            <span className="goals-stat-val goals-stat-val--accent">
              {overallPercentage}%
            </span>
          </div>
          <div className="goals-stat-item">
            <span className="goals-stat-label">Completed Goals</span>
            <span className="goals-stat-val">
              {completedGoalsCount} of {goals.length}
            </span>
          </div>
        </div>

        <div className="goal-progress-track">
          <div
            className={`goal-progress-fill ${overallPercentage >= 100 ? 'goal-progress-fill--complete' : ''}`}
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="dash-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-primary)' }}>No Savings Goals Yet</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            Set a goal for an emergency fund, travel, electronics, or personal investments.
          </p>
          <button
            type="button"
            className="goals-add-btn"
            onClick={openAddModal}
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const isCompleted = goal.savedAmount >= goal.targetAmount;
            const percentage = goal.targetAmount > 0
              ? Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100)
              : 0;
            const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);

            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-card-top">
                  <div className="goal-card-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="goal-card-info">
                    <h3 className="goal-card-name" title={goal.name}>{goal.name}</h3>
                    {goal.targetDate && (
                      <p className="goal-card-target-date">Target: {goal.targetDate}</p>
                    )}
                  </div>
                  <div className="goal-card-actions">
                    <button
                      type="button"
                      className="goal-action-btn"
                      onClick={() => openEditModal(goal)}
                      title="Edit Goal"
                      aria-label={`Edit ${goal.name}`}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="goal-action-btn goal-action-btn--delete"
                      onClick={() => setGoalToDelete(goal)}
                      title="Delete Goal"
                      aria-label={`Delete ${goal.name}`}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="goal-progress-wrap">
                  <div className="goal-progress-header">
                    <span className="goal-progress-percent">{percentage}% achieved</span>
                    <span className="goal-progress-remaining">
                      {isCompleted ? 'Target reached!' : `${formatINR(remaining)} left`}
                    </span>
                  </div>
                  <div className="goal-progress-track">
                    <div
                      className={`goal-progress-fill ${isCompleted ? 'goal-progress-fill--complete' : ''}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {formatINR(goal.savedAmount)}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      Target: {formatINR(goal.targetAmount)}
                    </span>
                  </div>
                </div>

                <div className="goal-card-bottom">
                  <button
                    type="button"
                    className="goal-deposit-btn"
                    onClick={() => openDepositModal(goal)}
                  >
                    + Add Funds
                  </button>
                  <span
                    className={`goal-status-badge ${isCompleted ? 'goal-status-badge--complete' : 'goal-status-badge--progress'}`}
                  >
                    {isCompleted ? '🎯 Goal Met' : 'In Progress'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      <Modal
        isOpen={isAddModalOpen || Boolean(editingGoal)}
        title={editingGoal ? 'Edit Goal' : 'Create New Goal'}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingGoal(null);
        }}
      >
        <form onSubmit={handleSaveGoal} className="expense-form" noValidate>
          {formError && (
            <div className="form-error" role="alert" style={{ marginBottom: '0.5rem' }}>
              {formError}
            </div>
          )}
          <div className="form-field">
            <label htmlFor="goal-name" className="form-label">
              Goal Name <span className="form-required">*</span>
            </label>
            <input
              id="goal-name"
              type="text"
              className="form-input"
              placeholder="e.g. Emergency Fund, Laptop, Vacation"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="goal-target" className="form-label">
              Target Amount (₹) <span className="form-required">*</span>
            </label>
            <input
              id="goal-target"
              type="number"
              step="1"
              min="1"
              className="form-input"
              placeholder="e.g. 50000"
              value={formTarget}
              onChange={(e) => setFormTarget(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="goal-saved" className="form-label">
              Already Saved (₹)
            </label>
            <input
              id="goal-saved"
              type="number"
              step="1"
              min="0"
              className="form-input"
              placeholder="0"
              value={formSaved}
              onChange={(e) => setFormSaved(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="goal-date" className="form-label">
              Target Date (Optional)
            </label>
            <input
              id="goal-date"
              type="date"
              className="form-input"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="form-btn form-btn-secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingGoal(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="form-btn form-btn-primary">
              {editingGoal ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Funds / Deposit Modal */}
      <Modal
        isOpen={Boolean(depositGoal)}
        title={depositGoal ? `Add Funds to ${depositGoal.name}` : 'Add Funds'}
        onClose={() => setDepositGoal(null)}
      >
        {depositGoal && (
          <form onSubmit={handleDepositSubmit} className="goal-deposit-form" noValidate>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
              Current saved: <strong>{formatINR(depositGoal.savedAmount)}</strong> of{' '}
              <strong>{formatINR(depositGoal.targetAmount)}</strong>
            </p>
            {depositError && (
              <div className="form-error" role="alert">
                {depositError}
              </div>
            )}
            <div className="form-field">
              <label htmlFor="deposit-amount" className="form-label">
                Amount to Deposit (₹) <span className="form-required">*</span>
              </label>
              <input
                id="deposit-amount"
                type="number"
                step="1"
                min="1"
                className="form-input"
                placeholder="e.g. 5000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="form-btn form-btn-secondary"
                onClick={() => setDepositGoal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="form-btn form-btn-primary">
                Add Funds
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(goalToDelete)}
        title="Delete Goal"
        onClose={() => setGoalToDelete(null)}
      >
        {goalToDelete && (
          <div className="delete-confirm">
            <p className="delete-confirm-message">
              Are you sure you want to delete the goal <strong>{goalToDelete.name}</strong> with target{' '}
              <strong>{formatINR(goalToDelete.targetAmount)}</strong>?
            </p>
            <div className="delete-confirm-actions">
              <button
                type="button"
                className="confirm-btn confirm-btn-secondary"
                onClick={() => setGoalToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-btn confirm-btn-danger"
                onClick={() => {
                  onDeleteGoal(goalToDelete.id);
                  setGoalToDelete(null);
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default GoalsSection;
