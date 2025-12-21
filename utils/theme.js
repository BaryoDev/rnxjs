/**
 * Theme management for rnxJS
 * Supports light/dark mode and custom themes with CSS custom properties
 */

/**
 * Theme configuration interface
 * @typedef {Object} ThemeConfig
 * @property {string} [mode] - 'light' or 'dark'
 * @property {Object} [variables] - CSS custom property values
 */

/**
 * Theme manager class
 * Handles theme registration, switching, and persistence
 */
class ThemeManager {
    constructor() {
        this.themes = new Map();
        this.currentTheme = 'default';
        this.subscribers = new Set();

        // Register built-in themes
        this.registerTheme('default', { mode: 'light' });
        this.registerTheme('dark', { mode: 'dark' });
    }

    /**
     * Register a custom theme
     * @param {string} name - Theme name
     * @param {ThemeConfig} config - Theme configuration
     */
    registerTheme(name, config) {
        this.themes.set(name, config);
    }

    /**
     * Get registered theme
     * @param {string} name - Theme name
     * @returns {ThemeConfig|undefined} - Theme configuration
     */
    getRegisteredTheme(name) {
        return this.themes.get(name);
    }

    /**
     * Get all registered theme names
     * @returns {string[]} - Array of theme names
     */
    getAvailableThemes() {
        return Array.from(this.themes.keys());
    }

    /**
     * Set the current theme
     * @param {string} name - Theme name to activate
     */
    setTheme(name) {
        const theme = this.themes.get(name);
        if (!theme) {
            console.warn(`[rnxJS] Theme not found: ${name}`);
            return;
        }

        this.currentTheme = name;

        // Apply theme to document
        document.documentElement.setAttribute('data-theme', name);

        // Apply mode if specified
        if (theme.mode) {
            document.documentElement.setAttribute('data-mode', theme.mode);
        }

        // Apply CSS custom properties
        if (theme.variables) {
            for (const [key, value] of Object.entries(theme.variables)) {
                const propertyName = key.startsWith('--') ? key : `--rnx-${key}`;
                document.documentElement.style.setProperty(propertyName, value);
            }
        }

        // Notify subscribers
        this.notifySubscribers(name, theme);

        // Persist preference
        this.savePreference(name);
    }

    /**
     * Get current theme name
     * @returns {string} - Current theme name
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Get current theme configuration
     * @returns {ThemeConfig|undefined} - Current theme config
     */
    getCurrentThemeConfig() {
        return this.themes.get(this.currentTheme);
    }

    /**
     * Toggle between light and dark mode
     * @returns {string} - New theme name
     */
    toggleDarkMode() {
        const currentConfig = this.getCurrentThemeConfig();
        const isDark = currentConfig?.mode === 'dark' ||
            document.documentElement.getAttribute('data-theme') === 'dark';

        const newTheme = isDark ? 'default' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    }

    /**
     * Detect system color scheme preference
     * @returns {string} - 'dark' or 'default'
     */
    detectSystemPreference() {
        if (!window.matchMedia) {
            return 'default';
        }

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'default';
    }

    /**
     * Check if dark mode is currently active
     * @returns {boolean} - True if dark mode is active
     */
    isDarkMode() {
        const config = this.getCurrentThemeConfig();
        return config?.mode === 'dark';
    }

    /**
     * Initialize theme from stored or system preference
     * @param {Object} [options] - Initialization options
     * @param {boolean} [options.respectSystemPreference=true] - Use system preference if no stored theme
     * @param {boolean} [options.watchSystemChanges=true] - Watch for system preference changes
     */
    init(options = {}) {
        const {
            respectSystemPreference = true,
            watchSystemChanges = true
        } = options;

        // Try to load stored preference
        const stored = this.loadPreference();
        if (stored && this.themes.has(stored)) {
            this.setTheme(stored);
            return;
        }

        // Fall back to system preference
        if (respectSystemPreference) {
            this.setTheme(this.detectSystemPreference());
        }

        // Listen for system preference changes
        if (watchSystemChanges && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const handler = (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!this.loadPreference()) {
                    this.setTheme(e.matches ? 'dark' : 'default');
                }
            };

            // Modern API
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handler);
            } else {
                // Fallback for older browsers
                mediaQuery.addListener(handler);
            }
        }
    }

    /**
     * Subscribe to theme changes
     * @param {Function} callback - Called when theme changes
     * @returns {Function} - Unsubscribe function
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    /**
     * Notify all subscribers of theme change
     * @param {string} themeName - New theme name
     * @param {ThemeConfig} themeConfig - New theme config
     * @private
     */
    notifySubscribers(themeName, themeConfig) {
        for (const callback of this.subscribers) {
            try {
                callback(themeName, themeConfig);
            } catch (error) {
                console.error('[rnxJS] Error in theme subscriber:', error);
            }
        }
    }

    /**
     * Save theme preference to storage
     * @param {string} themeName - Theme name to save
     * @private
     */
    savePreference(themeName) {
        try {
            localStorage.setItem('rnx-theme', themeName);
        } catch (e) {
            // localStorage not available (private mode, etc.)
            console.warn('[rnxJS] Could not save theme preference:', e.message);
        }
    }

    /**
     * Load theme preference from storage
     * @returns {string|null} - Stored theme name or null
     * @private
     */
    loadPreference() {
        try {
            return localStorage.getItem('rnx-theme');
        } catch (e) {
            // localStorage not available
            return null;
        }
    }

    /**
     * Clear stored theme preference
     */
    clearPreference() {
        try {
            localStorage.removeItem('rnx-theme');
        } catch (e) {
            // Ignore errors
        }
    }
}

// Singleton instance
export const theme = new ThemeManager();

// Convenience functions
export function setTheme(name) {
    return theme.setTheme(name);
}

export function getTheme() {
    return theme.getTheme();
}

export function toggleDarkMode() {
    return theme.toggleDarkMode();
}

export function isDarkMode() {
    return theme.isDarkMode();
}

export function registerTheme(name, config) {
    return theme.registerTheme(name, config);
}
