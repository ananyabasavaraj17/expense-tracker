import RupeeLogo from './RupeeLogo';
import './Navbar.css';

/**
 * Derives initials from a given full name (e.g. "Ananya" -> "AN", "Ananya Sharma" -> "AS").
 */
function getInitials(name) {
  if (!name || typeof name !== 'string') return 'AN';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AN';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SECTION_TITLES = {
  overview: 'Dashboard Overview',
  transactions: 'Transactions Ledger',
  analytics: 'Financial Analytics',
  goals: 'Savings Goals',
  categories: 'Categories Manager',
  settings: 'Profile & Settings',
};

/**
 * Top application header bar with section heading, action controls,
 * theme toggle, and Ananya user profile avatar.
 */
function Navbar({
  activeSection = 'overview',
  profileName = 'Ananya',
  onAddExpense,
  onOpenSettings,
  isDarkMode,
  onToggleDarkMode,
  onToggleSidebar,
}) {
  const initials = getInitials(profileName);
  const sectionTitle = SECTION_TITLES[activeSection] || 'Overview';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Left: Mobile hamburger + Mobile Brand / Desktop Section Heading */}
        <div className="navbar-left">
          {onToggleSidebar && (
            <button
              type="button"
              className="navbar-menu-btn"
              onClick={onToggleSidebar}
              aria-label="Toggle navigation menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          {/* Desktop active section heading (no duplicate brand row!) */}
          <div className="navbar-desktop-heading">
            <span className="navbar-section-title">{sectionTitle}</span>
          </div>

          {/* Mobile brand (only visible on mobile screens <= 900px) */}
          <div className="navbar-mobile-brand">
            <RupeeLogo size={28} />
            <span className="navbar-mobile-brand-name">RupeeWise</span>
          </div>
        </div>

        {/* Right: Actions & User Profile */}
        <div className="navbar-actions">
          {/* Theme switch */}
          <button
            type="button"
            className="navbar-icon-btn"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Add Transaction button */}
          <button
            type="button"
            className="navbar-primary-btn"
            onClick={onAddExpense}
          >
            <span aria-hidden="true">+</span>
            <span>Add Transaction</span>
          </button>

          {/* Profile Name & Avatar */}
          <button
            type="button"
            className="navbar-profile-btn"
            onClick={onOpenSettings}
            title={`Profile Settings (${profileName})`}
            aria-label={`Profile: ${profileName}`}
          >
            <span className="navbar-avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="navbar-profile-name">{profileName}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
