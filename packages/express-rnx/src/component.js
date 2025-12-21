/**
 * Component rendering
 */

/**
 * Escape HTML special characters
 *
 * @param {string} text Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, char => map[char]);
}

/**
 * Convert snake_case to kebab-case
 *
 * @param {string} str Input string
 * @returns {string} Kebab-cased string
 */
function toKebabCase(str) {
  return str.replace(/_/g, '-');
}

/**
 * Render an rnxJS component
 *
 * @param {string} name Component name
 * @param {Object} props Component properties
 * @returns {string} HTML component tag
 */
function renderComponent(name, props = {}) {
  const attrs = [];

  for (const [key, value] of Object.entries(props)) {
    // Convert snake_case to kebab-case
    const attrName = toKebabCase(key);

    if (typeof value === 'boolean') {
      if (value) {
        attrs.push(attrName);
      }
      continue;
    }

    // Check for data binding expressions
    if (typeof value === 'string' && (
      value.startsWith('state.') ||
      value.startsWith('{') ||
      value.startsWith('[')
    )) {
      // Preserve data binding expressions
      attrs.push(`${attrName}="${value}"`);
    } else if (typeof value === 'number') {
      attrs.push(`${attrName}=${value}`);
    } else {
      // Escape and quote string values
      const escaped = escapeHtml(String(value));
      attrs.push(`${attrName}="${escaped}"`);
    }
  }

  const attrsStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  return `<${name}${attrsStr}></${name}>`;
}

module.exports = { renderComponent, escapeHtml, toKebabCase };
