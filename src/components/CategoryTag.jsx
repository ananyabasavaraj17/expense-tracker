import './CategoryTag.css';

/**
 * Displays an expense category as a colour-coded pill tag using its configured hex color.
 *
 * @param {Object} props
 * @param {string} props.name - Category display name.
 * @param {string} [props.color='#475569'] - Hex color for the tag accent.
 */
function CategoryTag({ name, color = '#475569' }) {
  return (
    <span
      className="category-tag"
      style={{ '--category-color': color }}
    >
      <span className="category-tag-dot" aria-hidden="true" />
      <span>{name}</span>
    </span>
  );
}

export default CategoryTag;
