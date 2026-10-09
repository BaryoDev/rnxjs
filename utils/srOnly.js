import { resolveUtility } from './ThemeProvider.js';

const SR_ONLY_STYLE = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';

/**
 * Attribute string that hides text visually but keeps it for screen readers.
 * Uses the active theme's class, or an inline style when the theme has none
 * (custom themes only need `name` and `components`).
 *
 * @returns {string} e.g. `class="visually-hidden"` or `style="..."`
 */
export function srOnlyAttr() {
  const cls = resolveUtility('a11y', 'srOnly');
  return cls ? `class="${cls}"` : `style="${SR_ONLY_STYLE}"`;
}
