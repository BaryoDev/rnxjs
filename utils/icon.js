import { resolveUtility } from './ThemeProvider.js';

/**
 * Class string for an icon by name, from the active theme's icon set.
 * A theme maps names through `utilities.icon.className(name)`; themes
 * without one (custom themes only need `name` and `components`) fall back
 * to Bootstrap Icons. A leading `bi-` is stripped so `heart` and `bi-heart`
 * resolve the same.
 *
 * Returns raw classes: escape at the call site.
 *
 * @param {string} name - Icon name, e.g. 'check'
 * @returns {string} e.g. 'bi bi-check'
 */
export function resolveIcon(name) {
  if (!name) return '';
  const icon = String(name).replace(/^bi-/, '');
  return resolveUtility('icon', 'className', icon) || `bi bi-${icon}`;
}
