import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EmptyState from './components/EmptyState';
import ExpenseList from './components/ExpenseList';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import GoalsSection from './components/GoalsSection';
import InsightsCard from './components/InsightsCard';
import Modal from './components/Modal';
import ExpenseForm from './components/ExpenseForm';
import CategoryManager from './components/CategoryManager';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { formatINR } from './utils/currency';
import {
  DEFAULT_CATEGORIES,
  STORAGE_KEYS,
  createUniqueId,
  isValidCategoriesArray,
  isValidExpensesArray,
  isValidGoalsArray,
  normalizeExpenses,
} from './constants/categories';
import './App.css';

const DEFAULT_GOALS = [
  {
    id: 'goal-emergency',
    name: 'Emergency Fund',
    targetAmount: 100000,
    savedAmount: 45000,
    targetDate: '2026-12-31',
  },
  {
    id: 'goal-gadget',
    name: 'New Laptop',
    targetAmount: 65000,
    savedAmount: 30000,
    targetDate: '2026-11-30',
  },
];

/**
 * Root application component for RupeeWise.
 * Manages persisted transactions, categories, goals, profile & financial settings, theme, and navigation.
 */
function App() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage(
    'expense-tracker:theme-dark',
    false,
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  // Profile name, monthly income, and monthly budget
  const [profileName, setProfileName] = useLocalStorage(
    STORAGE_KEYS.PROFILE_NAME,
    'Ananya',
    { isValid: (val) => typeof val === 'string' && val.trim() !== '' },
  );

  const [monthlyIncome, setMonthlyIncome] = useLocalStorage(
    STORAGE_KEYS.MONTHLY_INCOME,
    null,
    { isValid: (val) => val === null || (typeof val === 'number' && Number.isFinite(val)) },
  );

  const [monthlyBudget, setMonthlyBudget] = useLocalStorage(
    STORAGE_KEYS.MONTHLY_BUDGET,
    null,
    { isValid: (val) => val === null || (typeof val === 'number' && Number.isFinite(val)) },
  );

  const [categories, setCategories] = useLocalStorage(
    STORAGE_KEYS.CATEGORIES,
    DEFAULT_CATEGORIES,
    { isValid: isValidCategoriesArray },
  );

  const [rawExpenses, setRawExpenses] = useLocalStorage(
    STORAGE_KEYS.EXPENSES,
    [],
    { isValid: isValidExpensesArray },
  );

  const [goals, setGoals] = useLocalStorage(
    STORAGE_KEYS.GOALS,
    DEFAULT_GOALS,
    { isValid: isValidGoalsArray },
  );

  const expenses = useMemo(
    () => normalizeExpenses(rawExpenses, categories),
    [rawExpenses, categories],
  );

  // Navigation and sidebar state
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  function handleOpenForm() {
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
  }

  function handleAddExpense(newExpense) {
    setRawExpenses((prev) => [newExpense, ...normalizeExpenses(prev, categories)]);
    setIsFormOpen(false);
  }

  function handleRequestDelete(expense) {
    setExpenseToDelete(expense);
  }

  function handleCancelDelete() {
    setExpenseToDelete(null);
  }

  function handleConfirmDelete() {
    if (!expenseToDelete) return;
    setRawExpenses((prev) =>
      normalizeExpenses(prev, categories).filter(
        (item) => item.id !== expenseToDelete.id,
      ),
    );
    setExpenseToDelete(null);
  }

  function handleAddCategory({ name, color }) {
    const newCategory = {
      id: createUniqueId('cat'),
      name,
      color,
    };
    setCategories((prev) => [...prev, newCategory]);
  }

  function handleUpdateCategory({ id, name, color }) {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, name, color } : cat)),
    );
  }

  function handleDeleteCategory(categoryId) {
    const isUsed = expenses.some((expense) => expense.categoryId === categoryId);
    if (isUsed) return;
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  }

  function handleSaveSettings({ name, income, budget }) {
    setProfileName(name);
    setMonthlyIncome(income);
    setMonthlyBudget(budget);
    setIsSettingsOpen(false);
  }

  // Goals handlers
  function handleAddGoal(newGoal) {
    setGoals((prev) => [...prev, newGoal]);
  }

  function handleUpdateGoal(updatedGoal) {
    setGoals((prev) =>
      prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
    );
  }

  function handleDeleteGoal(goalId) {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  const deleteCategoryName = expenseToDelete
    ? categories.find((cat) => cat.id === expenseToDelete.categoryId)?.name ||
      'Other'
    : '';

  return (
    <div className="app-shell">
      <Sidebar
        activeSection={activeSection}
        onNavigate={(sec) => {
          setActiveSection(sec);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="app-main-wrapper">
        <Navbar
          activeSection={activeSection}
          profileName={profileName}
          onAddExpense={handleOpenForm}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="main-content">
          <div className="content-container">
            {/* 1. Overview Section */}
            {activeSection === 'overview' && (
              <>
                <div className="overview-welcome-banner">
                  <div>
                    <h1 className="overview-welcome-title">
                      Welcome back, {profileName} 
                    </h1>
                    <p className="overview-welcome-tagline">
                      Your money, in focus. Here is your latest financial summary.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="navbar-primary-btn"
                    onClick={handleOpenForm}
                  >
                    <span aria-hidden="true">+</span>
                    <span>Add Transaction</span>
                  </button>
                </div>

                <AnalyticsDashboard
                  expenses={expenses}
                  categories={categories}
                  monthlyIncome={monthlyIncome}
                  monthlyBudget={monthlyBudget}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />

                <InsightsCard
                  expenses={expenses}
                  categories={categories}
                  monthlyIncome={monthlyIncome}
                  monthlyBudget={monthlyBudget}
                />

                {expenses.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ExpenseList
                    expenses={expenses}
                    categories={categories}
                    onDeleteExpense={handleRequestDelete}
                    title="Recent Transactions"
                    limit={5}
                    onViewAll={() => setActiveSection('transactions')}
                  />
                )}
              </>
            )}

            {/* 2. Transactions Section */}
            {activeSection === 'transactions' && (
              <>
                <div className="overview-welcome-banner">
                  <div>
                    <h1 className="overview-welcome-title">Transactions</h1>
                    <p className="overview-welcome-tagline">
                      View, filter, and manage all your expenses and income records.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="navbar-primary-btn"
                    onClick={handleOpenForm}
                  >
                    <span aria-hidden="true">+</span>
                    <span>Add Transaction</span>
                  </button>
                </div>

                {expenses.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ExpenseList
                    expenses={expenses}
                    categories={categories}
                    onDeleteExpense={handleRequestDelete}
                    title="All Transactions"
                    showFilters={true}
                  />
                )}
              </>
            )}

            {/* 3. Analytics Section */}
            {activeSection === 'analytics' && (
              <AnalyticsDashboard
                expenses={expenses}
                categories={categories}
                monthlyIncome={monthlyIncome}
                monthlyBudget={monthlyBudget}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            {/* 4. Goals Section */}
            {activeSection === 'goals' && (
              <GoalsSection
                goals={goals}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            )}

            {/* 5. Categories Section */}
            {activeSection === 'categories' && (
              <div className="dash-card" style={{ padding: '1.5rem' }}>
                <h2 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>
                  Manage Categories
                </h2>
                <CategoryManager
                  categories={categories}
                  expenses={expenses}
                  onAddCategory={handleAddCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onDeleteCategory={handleDeleteCategory}
                />
              </div>
            )}

            {/* 6. Settings Section */}
            {activeSection === 'settings' && (
              <div
                className="dash-card"
                style={{
                  padding: '2rem',
                  maxWidth: '640px',
                  width: '100%',
                  margin: '0 auto',
                }}
              >
                <h2 className="dash-card-title" style={{ marginBottom: '0.4rem' }}>
                  Profile & Financial Settings
                </h2>
                <p className="dash-card-subtitle" style={{ marginBottom: '1.5rem' }}>
                  Update your display name, monthly income, and budget targets.
                </p>
                <ProfileSettingsModal
                  profileName={profileName}
                  monthlyIncome={monthlyIncome}
                  monthlyBudget={monthlyBudget}
                  onSave={handleSaveSettings}
                  onCancel={() => setActiveSection('overview')}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isFormOpen}
        title="Add Transaction"
        onClose={handleCloseForm}
      >
        <ExpenseForm
          categories={categories}
          onSubmit={handleAddExpense}
          onCancel={handleCloseForm}
        />
      </Modal>

      {/* Profile & Financial Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        title="Profile & Financial Settings"
        onClose={() => setIsSettingsOpen(false)}
      >
        <ProfileSettingsModal
          profileName={profileName}
          monthlyIncome={monthlyIncome}
          monthlyBudget={monthlyBudget}
          onSave={handleSaveSettings}
          onCancel={() => setIsSettingsOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(expenseToDelete)}
        title={expenseToDelete?.type === 'income' ? 'Delete Income' : 'Delete Expense'}
        onClose={handleCancelDelete}
      >
        {expenseToDelete && (
          <div className="delete-confirm">
            <p className="delete-confirm-message">
              Are you sure you want to delete this{' '}
              <strong>
                {expenseToDelete.type === 'income' ? 'Income' : `${deleteCategoryName} Expense`}
              </strong>{' '}
              of{' '}
              <strong>
                {formatINR(expenseToDelete.amount)}
              </strong>{' '}
              on <strong>{expenseToDelete.date}</strong>?
            </p>
            <div className="delete-confirm-actions">
              <button
                type="button"
                className="confirm-btn confirm-btn-secondary"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-btn confirm-btn-danger"
                onClick={handleConfirmDelete}
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

export default App;
