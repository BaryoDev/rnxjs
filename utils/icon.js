import { themeProvider } from './ThemeProvider.js';

/**
 * Class string for an icon by name, from the active theme's icon set.
 * A theme maps names through `utilities.icon.className(name)`; themes
 * without one (custom themes only need `name` and `components`) fall back
 * to Bootstrap Icons. A leading `bi-` is stripped so `heart` and `bi-heart`
 * resolve the same.
 *
 * Returns raw classes: escape at the call site. Whatever the theme's
 * function returns is used as is, including an empty string.
 *
 * @param {string} name - Icon name, e.g. 'check'
 * @returns {string} e.g. 'bi bi-check'
 */
export function resolveIcon(name) {
  if (typeof name !== 'string') return '';
  const icon = name.trim().replace(/^bi-/, '');
  if (!icon) return '';
  const className = themeProvider.getTheme()?.utilities?.icon?.className;
  return typeof className === 'function' ? String(className(icon) ?? '') : `bi bi-${icon}`;
}
