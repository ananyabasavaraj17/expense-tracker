import './EmptyState.css';

/**
 * Reusable empty state card shown when no items are available.
 *
 * @param {Object} props
 * @param {string} [props.title='No expenses yet'] - Primary empty state heading.
 * @param {string} [props.description] - Supporting message encouraging the next action.
 * @param {import('react').ReactNode} [props.icon] - Optional custom icon or illustration.
 */
function EmptyState({
  title = 'No expenses yet',
  description = 'Your expense ledger is empty. Click "Add Expense" in the top bar to record your first expense.',
  icon,
}) {
  return (
    <section className="empty-state" aria-labelledby="empty-state-title">
      <div className="empty-state-illustration" aria-hidden="true">
        {icon || (
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="32" cy="32" r="28" className="illustration-circle" />
            <rect
              x="18"
              y="16"
              width="28"
              height="32"
              rx="4"
              className="illustration-card"
            />
            <line
              x1="24"
              y1="25"
              x2="40"
              y2="25"
              className="illustration-line-strong"
            />
            <line
              x1="24"
              y1="32"
              x2="36"
              y2="32"
              className="illustration-line"
            />
            <line
              x1="24"
              y1="39"
              x2="33"
              y2="39"
              className="illustration-line"
            />
            <circle cx="43" cy="43" r="8" className="illustration-badge" />
            <path
              d="M43 39.5V46.5M39.5 43H46.5"
              className="illustration-plus"
            />
          </svg>
        )}
      </div>

      <h2 id="empty-state-title" className="empty-state-title">
        {title}
      </h2>
      <p className="empty-state-description">{description}</p>
    </section>
  );
}

export default EmptyState;
