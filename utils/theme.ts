/**
 * Theme management for rnxJS
 * Supports light/dark mode and custom themes with CSS custom properties
 */

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
    mode?: 'light' | 'dark';
    variables?: Record<string, string>;
}

/**
 * Theme subscriber callback type
 */
export type ThemeSubscriber = (themeName: string, themeConfig: ThemeConfig) => void;

/**
 * Theme initialization options
 */
export interface ThemeInitOptions {
    respectSystemPreference?: boolean;
    watchSystemChanges?: boolean;
}

/**
 * Theme manager class
 * Handles theme registration, switching, and persistence
 */
class ThemeManager {
    private themes: Map<string, ThemeConfig>;
    private currentTheme: string;
    private subscribers: Set<ThemeSubscriber>;

    constructor() {
        this.themes = new Map<string, ThemeConfig>();
        this.currentTheme = 'default';
        this.subscribers = new Set<ThemeSubscriber>();

        // Register built-in themes
        this.registerTheme('default', { mode: 'light' });
        this.registerTheme('dark', { mode: 'dark' });
    }

    /**
     * Register a custom theme
     * @param name - Theme name
     * @param config - Theme configuration
     */
    registerTheme(name: string, config: ThemeConfig): void {
        this.themes.set(name, config);
    }

    /**
     * Get registered theme
     * @param name - Theme name
     * @returns Theme configuration or undefined
     */
    getRegisteredTheme(name: string): ThemeConfig | undefined {
        return this.themes.get(name);
    }

    /**
     * Get all registered theme names
     * @returns Array of theme names
     */
    getAvailableThemes(): string[] {
        return Array.from(this.themes.keys());
    }

    /**
     * Set the current theme
     * @param name - Theme name to activate
     */
    setTheme(name: string): void {
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
     * @returns Current theme name
     */
    getTheme(): string {
        return this.currentTheme;
    }

    /**
     * Get current theme configuration
     * @returns Current theme config or undefined
     */
    getCurrentThemeConfig(): ThemeConfig | undefined {
        return this.themes.get(this.currentTheme);
    }

    /**
     * Toggle between light and dark mode
     * @returns New theme name
     */
    toggleDarkMode(): string {
        const currentConfig = this.getCurrentThemeConfig();
        const isDark = currentConfig?.mode === 'dark' ||
            document.documentElement.getAttribute('data-theme') === 'dark';

        const newTheme = isDark ? 'default' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    }

    /**
     * Detect system color scheme preference
     * @returns 'dark' or 'default'
     */
    detectSystemPreference(): string {
        if (!window.matchMedia) {
            return 'default';
        }

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'default';
    }

    /**
     * Check if dark mode is currently active
     * @returns True if dark mode is active
     */
    isDarkMode(): boolean {
        const config = this.getCurrentThemeConfig();
        return config?.mode === 'dark';
    }

    /**
     * Initialize theme from stored or system preference
     * @param options - Initialization options
     */
    init(options: ThemeInitOptions = {}): void {
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

            const handler = (e: MediaQueryListEvent): void => {
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
                (mediaQuery as any).addListener(handler);
            }
        }
    }

    /**
     * Subscribe to theme changes
     * @param callback - Called when theme changes
     * @returns Unsubscribe function
     */
    subscribe(callback: ThemeSubscriber): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    /**
     * Notify all subscribers of theme change
     * @param themeName - New theme name
     * @param themeConfig - New theme config
     * @private
     */
    private notifySubscribers(themeName: string, themeConfig: ThemeConfig): void {
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
     * @param themeName - Theme name to save
     * @private
     */
    private savePreference(themeName: string): void {
        try {
            localStorage.setItem('rnx-theme', themeName);
        } catch (e) {
            // localStorage not available (private mode, etc.)
            if (e instanceof Error) {
                console.warn('[rnxJS] Could not save theme preference:', e.message);
            }
        }
    }

    /**
     * Load theme preference from storage
     * @returns Stored theme name or null
     * @private
     */
    private loadPreference(): string | null {
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
    clearPreference(): void {
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
export function setTheme(name: string): void {
    return theme.setTheme(name);
}

export function getTheme(): string {
    return theme.getTheme();
}

export function toggleDarkMode(): string {
    return theme.toggleDarkMode();
}

export function isDarkMode(): boolean {
    return theme.isDarkMode();
}

export function registerTheme(name: string, config: ThemeConfig): void {
    return theme.registerTheme(name, config);
}
