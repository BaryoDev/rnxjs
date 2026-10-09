/**
 * Theme Provider for rnxJS
 *
 * Manages active theme and provides class resolution for components.
 * Supports multiple themes simultaneously (e.g., Bootstrap + Tailwind in same app).
 *
 * @module utils/ThemeProvider
 */

import { bootstrapTheme } from '../themes/bootstrap/index.js';
import { tailwindTheme } from '../themes/tailwind/index.js';

const MODE_KEY = 'rnx-mode';
const MODES = ['light', 'dark', 'system'];
const DARK_QUERY = '(prefers-color-scheme: dark)';

class ThemeProvider {
  constructor() {
    this.themes = new Map();
    this.activeTheme = null;
    this.subscribers = new Set();

    // Colour mode. Default is light so existing apps see no change.
    this.mode = 'light';
    this.resolvedMode = 'light';
    this.mediaQuery = null;
    this.onSystemChange = null;

    // Register default themes
    this.registerTheme(bootstrapTheme);
    this.registerTheme(tailwindTheme);

    // Default to Bootstrap so existing apps look unchanged after upgrading;
    // Tailwind is a one-line opt-in via setTheme('tailwind')
    this.setTheme('bootstrap');

    // Restore a saved choice. With nothing saved, leave the document alone.
    const stored = this.readStoredMode();
    if (stored) this.setMode(stored, { persist: false });
  }

  /**
   * Register a custom theme
   *
   * @param {Object} theme - Theme configuration object
   * @param {string} theme.name - Unique theme identifier
   * @param {Object} theme.components - Component class mappings
   * @param {Object} theme.utilities - Utility class helpers
   * @throws {Error} If theme configuration is invalid
   *
   * @example
   * themeProvider.registerTheme({
   *   name: 'my-custom-theme',
   *   components: {
   *     button: {
   *       base: 'btn-custom',
   *       variants: { primary: 'btn-primary-custom' }
   *     }
   *   },
   *   utilities: {
   *     spacing: {
   *       m: (size) => `margin-${size}`
   *     }
   *   }
   * });
   */
  registerTheme(theme) {
    if (!theme || typeof theme !== 'object') {
      throw new Error('[rnxJS] Theme must be an object');
    }

    if (!theme.name || typeof theme.name !== 'string') {
      throw new Error('[rnxJS] Theme must have a name property (string)');
    }

    if (!theme.components || typeof theme.components !== 'object') {
      throw new Error('[rnxJS] Theme must have a components property (object)');
    }

    this.themes.set(theme.name, theme);
    console.info(`[rnxJS] Theme registered: ${theme.name}`);
  }

  /**
   * Set active theme
   *
   * @param {string} themeName - Name of theme to activate
   *
   * @example
   * import { setTheme } from '@arnelirobles/rnxjs';
   * setTheme('bootstrap'); // Switch to Bootstrap theme
   * setTheme('tailwind');  // Switch to Tailwind theme
   */
  setTheme(themeName) {
    const theme = this.themes.get(themeName);

    if (!theme) {
      console.error(
        `[rnxJS] Theme "${themeName}" not found. Available themes:`,
        Array.from(this.themes.keys())
      );
      return;
    }

    this.activeTheme = theme;
    this.notifySubscribers();

    console.info(`[rnxJS] Active theme: ${themeName}`);
  }

  /**
   * Get active theme
   *
   * @returns {Object|null} - Active theme configuration or null
   */
  getTheme() {
    return this.activeTheme;
  }

  /**
   * Set the colour mode
   *
   * @param {'light'|'dark'|'system'} mode - 'system' follows prefers-color-scheme live
   * @param {Object} [options]
   * @param {boolean} [options.persist=true] - Save the choice to localStorage
   *
   * @example
   * import { setMode } from '@arnelirobles/rnxjs';
   * setMode('dark');
   */
  setMode(mode, { persist = true } = {}) {
    if (!MODES.includes(mode)) {
      console.error(`[rnxJS] Mode "${mode}" is not valid. Use one of:`, MODES);
      return;
    }

    this.stopWatchingSystem();
    this.mode = mode;

    if (mode === 'system') this.watchSystem();
    this.resolvedMode = this.resolveMode();

    if (persist) this.storeMode(mode);
    this.applyMode();
    this.notifySubscribers();
  }

  /**
   * Get the stored colour choice
   *
   * @returns {'light'|'dark'|'system'}
   */
  getMode() {
    return this.mode;
  }

  /**
   * Get the colour mode in effect
   *
   * @returns {'light'|'dark'} - What 'system' currently resolves to, otherwise the choice
   */
  getResolvedMode() {
    return this.resolvedMode;
  }

  /** @private */
  resolveMode() {
    if (this.mode !== 'system') return this.mode;
    return this.mediaQuery && this.mediaQuery.matches ? 'dark' : 'light';
  }

  /** @private */
  applyMode() {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-mode', this.resolvedMode);
    // Bootstrap 5.3 has its own dark mode, keyed on this attribute.
    document.documentElement.setAttribute('data-bs-theme', this.resolvedMode);
  }

  /** @private */
  watchSystem() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    this.mediaQuery = window.matchMedia(DARK_QUERY);
    this.onSystemChange = () => {
      this.resolvedMode = this.resolveMode();
      this.applyMode();
      this.notifySubscribers();
    };
    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', this.onSystemChange);
    } else if (this.mediaQuery.addListener) {
      this.mediaQuery.addListener(this.onSystemChange);
    }
  }

  /** @private */
  stopWatchingSystem() {
    const mq = this.mediaQuery;
    if (mq && this.onSystemChange) {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', this.onSystemChange);
      } else if (mq.removeListener) {
        mq.removeListener(this.onSystemChange);
      }
    }
    this.mediaQuery = null;
    this.onSystemChange = null;
  }

  /** @private */
  readStoredMode() {
    try {
      const value = localStorage.getItem(MODE_KEY);
      return MODES.includes(value) ? value : null;
    } catch {
      return null;
    }
  }

  /** @private */
  storeMode(mode) {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      // storage is off or full: the mode still applies for this page
    }
  }

  /**
   * Subscribe to theme changes
   *
   * @param {Function} callback - Called with (theme, { mode, resolvedMode }) when the theme or mode changes
   * @returns {Function} - Unsubscribe function
   *
   * @example
   * const unsubscribe = themeProvider.subscribe((theme) => {
   *   console.log('Theme changed to:', theme.name);
   * });
   * // Later: unsubscribe();
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.warn('[rnxJS] ThemeProvider.subscribe: callback must be a function');
      return () => {};
    }

    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers of theme change
   * @private
   */
  notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.activeTheme, { mode: this.mode, resolvedMode: this.resolvedMode });
      } catch (error) {
        console.error('[rnxJS] Error in theme subscriber:', error);
      }
    });
  }

  /**
   * Resolve classes for a component
   *
   * @param {string} component - Component name (e.g., 'button', 'card')
   * @param {Object} options - Component options (variant, size, states, modifiers)
   * @param {string} [options.variant] - Variant name (e.g., 'primary', 'secondary')
   * @param {string} [options.size] - Size name (e.g., 'sm', 'md', 'lg')
   * @param {Object} [options.states] - State flags (e.g., { disabled: true, active: false })
   * @param {Object} [options.modifiers] - Modifier flags (e.g., { block: true, outline: false })
   * @param {string} userClasses - User-provided className
   * @returns {string} - Resolved class string
   *
   * @example
   * const classes = themeProvider.resolveClasses('button', {
   *   variant: 'primary',
   *   size: 'lg',
   *   disabled: true,
   *   block: true
   * }, 'my-custom-class');
   * // Returns: "btn btn-primary btn-lg disabled w-100 my-custom-class" (Bootstrap)
   * // or: "inline-flex px-6 py-3 bg-blue-600 opacity-50 w-full my-custom-class" (Tailwind)
   */
  resolveClasses(component, options = {}, userClasses = '') {
    const theme = this.activeTheme;

    if (!theme) {
      console.warn('[rnxJS] No active theme. Classes will not be resolved.');
      return userClasses;
    }

    const componentConfig = theme.components[component];

    if (!componentConfig) {
      console.warn(`[rnxJS] Component "${component}" not found in theme "${theme.name}"`);
      return userClasses;
    }

    const classes = [];

    // 1. Base classes (always applied)
    if (componentConfig.base) {
      classes.push(componentConfig.base);
    }

    // 2. Variant classes
    if (options.variant && componentConfig.variants) {
      const variantClass = componentConfig.variants[options.variant];
      if (variantClass) {
        classes.push(variantClass);
      } else {
        console.warn(`[rnxJS] Variant "${options.variant}" not found for component "${component}"`);
      }
    }

    // 3. Size classes
    if (options.size && componentConfig.sizes) {
      const sizeClass = componentConfig.sizes[options.size];
      if (sizeClass) {
        classes.push(sizeClass);
      }
    }

    // 4. State classes (disabled, active, loading, etc.)
    if (componentConfig.states) {
      Object.keys(componentConfig.states).forEach(state => {
        if (options[state] === true || options[state] === 'true') {
          classes.push(componentConfig.states[state]);
        }
      });
    }

    // 5. Modifier classes (block, outline, rounded, etc.)
    if (componentConfig.modifiers) {
      Object.keys(componentConfig.modifiers).forEach(modifier => {
        if (options[modifier] === true || options[modifier] === 'true') {
          classes.push(componentConfig.modifiers[modifier]);
        }
      });
    }

    // 6. User-provided classes (highest priority, applied last)
    if (userClasses) {
      classes.push(userClasses);
    }

    return classes.filter(Boolean).join(' ');
  }

  /**
   * Resolve part classes for multi-part components
   *
   * @param {string} component - Component name
   * @param {string} part - Part name (e.g., 'header', 'body', 'footer')
   * @returns {string} - Part classes
   *
   * @example
   * const headerClasses = themeProvider.resolvePartClasses('card', 'header');
   * // Bootstrap: "card-header"
   * // Tailwind: "px-6 py-4 border-b border-slate-200 bg-slate-50"
   */
  resolvePartClasses(component, part) {
    const theme = this.activeTheme;

    if (!theme || !theme.components[component]) {
      return '';
    }

    const componentConfig = theme.components[component];

    if (componentConfig.parts && componentConfig.parts[part]) {
      return componentConfig.parts[part];
    }

    return '';
  }

  /**
   * Resolve utility classes
   *
   * @param {string} utilityType - Utility category (spacing, layout, sizing, etc.)
   * @param {string} utilityName - Utility name within category
   * @param {*} [value] - Utility value (optional, for parameterized utilities)
   * @returns {string} - Resolved utility class
   *
   * @example
   * const marginClass = themeProvider.resolveUtility('spacing', 'm', 4);
   * // Bootstrap: "m-4"
   * // Tailwind: "m-4"
   *
   * const flexClass = themeProvider.resolveUtility('layout', 'flex');
   * // Bootstrap: "d-flex"
   * // Tailwind: "flex"
   */
  resolveUtility(utilityType, utilityName, value = null) {
    const theme = this.activeTheme;

    if (!theme || !theme.utilities || !theme.utilities[utilityType]) {
      return '';
    }

    const utility = theme.utilities[utilityType][utilityName];

    if (typeof utility === 'function') {
      return utility(value);
    }

    return utility || '';
  }

  /**
   * Get list of all registered themes
   *
   * @returns {string[]} - Array of theme names
   */
  getAvailableThemes() {
    return Array.from(this.themes.keys());
  }

  /**
   * Check if a theme is registered
   *
   * @param {string} themeName - Theme name to check
   * @returns {boolean} - True if theme exists
   */
  hasTheme(themeName) {
    return this.themes.has(themeName);
  }
}

// Singleton instance
export const themeProvider = new ThemeProvider();

// Convenience exports for common operations
export const {
  resolveClasses, resolvePartClasses, resolveUtility, setTheme, registerTheme,
  setMode, getMode, getResolvedMode
} = {
  resolveClasses: (...args) => themeProvider.resolveClasses(...args),
  resolvePartClasses: (...args) => themeProvider.resolvePartClasses(...args),
  resolveUtility: (...args) => themeProvider.resolveUtility(...args),
  setTheme: (name) => themeProvider.setTheme(name),
  registerTheme: (theme) => themeProvider.registerTheme(theme),
  setMode: (mode, options) => themeProvider.setMode(mode, options),
  getMode: () => themeProvider.getMode(),
  getResolvedMode: () => themeProvider.getResolvedMode()
};

export default themeProvider;
