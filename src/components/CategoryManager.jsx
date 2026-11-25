import { useState } from 'react';
import CategoryTag from './CategoryTag';
import './CategoryManager.css';

const DEFAULT_NEW_COLOR = '#2563eb';

/**
 * Validates a category name for non-emptiness and uniqueness.
 *
 * @param {string} rawName
 * @param {Array<{ id: string, name: string }>} categories
 * @param {string | null} [excludeId]
 * @returns {string | null}
 */
function validateCategoryName(rawName, categories, excludeId = null) {
  const trimmed = rawName.trim();
  if (!trimmed) {
    return 'Category name is required.';
  }

  const normalized = trimmed.toLowerCase();
  const isDuplicate = categories.some(
    (cat) => cat.id !== excludeId && cat.name.trim().toLowerCase() === normalized,
  );

  if (isDuplicate) {
    return `Category "${trimmed}" already exists.`;
  }

  return null;
}

/**
 * Category management panel for adding, editing, and safely deleting categories.
 *
 * @param {Object} props
 * @param {Array<{ id: string, name: string, color: string }>} props.categories
 * @param {Array<{ id: string, categoryId: string }>} props.expenses
 * @param {Function} props.onAddCategory - Called with `{ name, color }`.
 * @param {Function} props.onUpdateCategory - Called with `{ id, name, color }`.
 * @param {Function} props.onDeleteCategory - Called with `categoryId`.
 */
function CategoryManager({
  categories,
  expenses,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_NEW_COLOR);
  const [addError, setAddError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(DEFAULT_NEW_COLOR);
  const [editError, setEditError] = useState('');

  const [deleteError, setDeleteError] = useState('');

  function getUsageCount(categoryId) {
    return expenses.filter((expense) => expense.categoryId === categoryId).length;
  }

  function handleAddSubmit(event) {
    event.preventDefault();
    const error = validateCategoryName(newName, categories);
    if (error) {
      setAddError(error);
      return;
    }

    onAddCategory({
      name: newName.trim(),
      color: newColor,
    });
    setNewName('');
    setNewColor(DEFAULT_NEW_COLOR);
    setAddError('');
    setDeleteError('');
  }

  function handleStartEdit(category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
    setEditError('');
    setDeleteError('');
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditError('');
  }

  function handleSaveEdit(categoryId) {
    const error = validateCategoryName(editName, categories, categoryId);
    if (error) {
      setEditError(error);
      return;
    }

    onUpdateCategory({
      id: categoryId,
      name: editName.trim(),
      color: editColor,
    });
    setEditingId(null);
    setEditError('');
  }

  function handleDeleteClick(category) {
    const usageCount = getUsageCount(category.id);
    if (usageCount > 0) {
      setDeleteError(
        `Cannot delete "${category.name}" because it is currently used by ${usageCount} ${
          usageCount === 1 ? 'expense' : 'expenses'
        }.`,
      );
      return;
    }

    setDeleteError('');
    if (editingId === category.id) {
      handleCancelEdit();
    }
    onDeleteCategory(category.id);
  }

  return (
    <div className="category-manager">
      <form className="category-add-form" onSubmit={handleAddSubmit} noValidate>
        <div className="category-add-fields">
          <div className="category-input-group">
            <label htmlFor="new-category-name" className="category-label">
              New Category
            </label>
            <input
              id="new-category-name"
              type="text"
              placeholder="e.g. Groceries"
              className={`category-text-input ${
                addError ? 'category-input-error' : ''
              }`}
              value={newName}
              onChange={(event) => {
                setNewName(event.target.value);
                if (addError) setAddError('');
              }}
              aria-invalid={Boolean(addError)}
            />
          </div>

          <div className="category-color-group">
            <label htmlFor="new-category-color" className="category-label">
              Color
            </label>
            <input
              id="new-category-color"
              type="color"
              className="category-color-input"
              value={newColor}
              onChange={(event) => setNewColor(event.target.value)}
              aria-label="New category color"
            />
          </div>

          <button type="submit" className="category-add-btn">
            Add
          </button>
        </div>

        {addError && (
          <p className="category-error-msg" role="alert">
            {addError}
          </p>
        )}
      </form>

      {deleteError && (
        <div className="category-alert-banner" role="alert">
          {deleteError}
        </div>
      )}

      <ul className="category-list" aria-label="Existing categories">
        {categories.map((category) => {
          const isEditing = editingId === category.id;
          const usageCount = getUsageCount(category.id);

          return (
            <li key={category.id} className="category-list-item">
              {isEditing ? (
                <div className="category-edit-block">
                  <div className="category-edit-row">
                    <input
                      type="color"
                      className="category-color-input"
                      value={editColor}
                      onChange={(event) => setEditColor(event.target.value)}
                      aria-label={`Color for ${category.name}`}
                    />
                    <input
                      type="text"
                      className={`category-text-input ${
                        editError ? 'category-input-error' : ''
                      }`}
                      value={editName}
                      onChange={(event) => {
                        setEditName(event.target.value);
                        if (editError) setEditError('');
                      }}
                      aria-label={`Name for ${category.name}`}
                      aria-invalid={Boolean(editError)}
                    />
                    <div className="category-item-actions">
                      <button
                        type="button"
                        className="category-action-btn category-action-save"
                        onClick={() => handleSaveEdit(category.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="category-action-btn"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {editError && (
                    <p className="category-error-msg" role="alert">
                      {editError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="category-view-row">
                  <div className="category-view-info">
                    <CategoryTag name={category.name} color={category.color} />
                    {usageCount > 0 && (
                      <span className="category-usage-badge">
                        {usageCount} {usageCount === 1 ? 'expense' : 'expenses'}
                      </span>
                    )}
                  </div>
                  <div className="category-item-actions">
                    <button
                      type="button"
                      className="category-action-btn"
                      onClick={() => handleStartEdit(category)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="category-action-btn category-action-delete"
                      onClick={() => handleDeleteClick(category)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CategoryManager;
