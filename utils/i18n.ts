/**
 * Internationalization (i18n) system for rnxJS
 * Supports translations, pluralization, formatting, and locale switching
 */

/**
 * Translation messages type (nested object structure)
 */
export type Messages = Record<string, any>;

/**
 * Pluralization forms
 */
export interface PluralForms {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other: string;
}

/**
 * Interpolation parameters for translations
 */
export type TranslationParams = Record<string, any>;

/**
 * Locale change subscriber callback
 */
export type LocaleSubscriber = (locale: string) => void;

/**
 * Message loader function (for lazy loading)
 */
export type MessageLoader = () => Promise<Messages> | Messages;

/**
 * Internationalization class
 * Handles translations, pluralization, formatting, and locale management
 */
class I18n {
    private locale: string;
    private fallbackLocale: string;
    private messages: Record<string, Messages>;
    private formatters: Record<string, Intl.NumberFormat | Intl.DateTimeFormat>;
    private subscribers: Set<LocaleSubscriber>;
    private currency: string;

    constructor() {
        this.locale = 'en';
        this.fallbackLocale = 'en';
        this.messages = {};
        this.formatters = {};
        this.subscribers = new Set();
        this.currency = 'USD';
    }

    /**
     * Set current locale
     * @param locale - Locale code (e.g., 'en', 'es', 'fr')
     */
    setLocale(locale: string): void {
        this.locale = locale;
        this.notifySubscribers();

        // Update document lang attribute for accessibility
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
        }

        // Save to localStorage
        this.savePreference(locale);
    }

    /**
     * Get current locale
     * @returns Current locale code
     */
    getLocale(): string {
        return this.locale;
    }

    /**
     * Set fallback locale
     * @param locale - Fallback locale code
     */
    setFallbackLocale(locale: string): void {
        this.fallbackLocale = locale;
    }

    /**
     * Set currency for formatting
     * @param currency - Currency code (e.g., 'USD', 'EUR')
     */
    setCurrency(currency: string): void {
        this.currency = currency;
    }

    /**
     * Load messages for a locale
     * @param locale - Locale code
     * @param messages - Messages object or loader function
     */
    async loadMessages(locale: string, messages: Messages | MessageLoader): Promise<void> {
        let loadedMessages: Messages;

        if (typeof messages === 'function') {
            // Lazy loading
            loadedMessages = await messages();
        } else {
            loadedMessages = messages;
        }

        this.messages[locale] = { ...this.messages[locale], ...loadedMessages };
    }

    /**
     * Get available locales
     * @returns Array of loaded locale codes
     */
    getAvailableLocales(): string[] {
        return Object.keys(this.messages);
    }

    /**
     * Translate a key
     * @param key - Translation key (dot notation: 'common.buttons.save')
     * @param params - Interpolation parameters
     * @param count - Pluralization count
     * @returns Translated string
     */
    t(key: string, params: TranslationParams = {}, count: number | null = null): string {
        const message = this.getMessage(key);

        if (message === null || message === undefined) {
            console.warn(`[rnxJS i18n] Missing translation: ${key}`);
            return key;
        }

        // Handle pluralization
        let text: string;
        if (count !== null && typeof message === 'object') {
            text = this.pluralize(message as PluralForms, count);
            // Automatically add count to params for interpolation
            params = { ...params, count };
        } else if (typeof message === 'string') {
            text = message;
        } else {
            console.warn(`[rnxJS i18n] Invalid message format for key: ${key}`);
            return key;
        }

        // Interpolate parameters
        return this.interpolate(text, params);
    }

    /**
     * Get message from messages object
     * @param key - Translation key (dot notation)
     * @returns Message or null if not found
     * @private
     */
    private getMessage(key: string): any {
        const locales = [this.locale, this.fallbackLocale];

        for (const locale of locales) {
            const messages = this.messages[locale];
            if (!messages) continue;

            const value = key.split('.').reduce(
                (obj: any, k: string) => obj?.[k],
                messages
            );

            if (value !== undefined) return value;
        }

        return null;
    }

    /**
     * Handle pluralization using Intl.PluralRules
     * @param messages - Plural forms object
     * @param count - Count for pluralization
     * @returns Pluralized message
     * @private
     */
    private pluralize(messages: PluralForms, count: number): string {
        // Support: { zero, one, two, few, many, other }

        // Handle explicit zero case (not all languages support zero rule)
        if (count === 0 && 'zero' in messages) {
            return messages.zero!;
        }

        const rules = new Intl.PluralRules(this.locale);
        const rule = rules.select(count);

        return (messages as any)[rule] || messages.other || String(messages);
    }

    /**
     * Interpolate parameters into message
     * @param message - Message with placeholders
     * @param params - Interpolation parameters
     * @returns Interpolated message
     * @private
     */
    private interpolate(message: string, params: TranslationParams): string {
        return message.replace(/\{(\w+)\}/g, (match: string, key: string) => {
            if (key in params) {
                const typeKey = `${key}Type`;
                const formatType = params[typeKey];
                return String(this.format(params[key], formatType));
            }
            return match;
        });
    }

    /**
     * Format a value based on type using Intl formatters
     * @param value - Value to format
     * @param type - Format type ('number', 'currency', 'date', 'relative')
     * @returns Formatted value
     * @private
     */
    private format(value: any, type?: string): any {
        if (!type) {
            return value;
        }

        if (type === 'number') {
            return new Intl.NumberFormat(this.locale).format(value);
        }

        if (type === 'currency') {
            return new Intl.NumberFormat(this.locale, {
                style: 'currency',
                currency: this.currency
            }).format(value);
        }

        if (type === 'date') {
            return new Intl.DateTimeFormat(this.locale).format(new Date(value));
        }

        if (type === 'relative') {
            const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });
            return rtf.format(value, 'day');
        }

        return value;
    }

    /**
     * Subscribe to locale changes
     * @param callback - Called when locale changes
     * @returns Unsubscribe function
     */
    subscribe(callback: LocaleSubscriber): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    /**
     * Notify subscribers of locale change
     * @private
     */
    private notifySubscribers(): void {
        for (const callback of this.subscribers) {
            try {
                callback(this.locale);
            } catch (error) {
                console.error('[rnxJS i18n] Error in locale subscriber:', error);
            }
        }
    }

    /**
     * Initialize i18n from stored or browser preference
     * @param options - Initialization options
     */
    init(options: { respectBrowserLocale?: boolean } = {}): void {
        const { respectBrowserLocale = true } = options;

        // Try to load stored preference
        const stored = this.loadPreference();
        if (stored && this.messages[stored]) {
            this.setLocale(stored);
            return;
        }

        // Fall back to browser locale
        if (respectBrowserLocale && typeof navigator !== 'undefined') {
            const browserLocale = navigator.language.split('-')[0];
            if (this.messages[browserLocale]) {
                this.setLocale(browserLocale);
                return;
            }
        }

        // Use fallback locale
        this.setLocale(this.fallbackLocale);
    }

    /**
     * Save locale preference to localStorage
     * @param locale - Locale to save
     * @private
     */
    private savePreference(locale: string): void {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('rnx-locale', locale);
            }
        } catch (e) {
            // localStorage not available
        }
    }

    /**
     * Load locale preference from localStorage
     * @returns Stored locale or null
     * @private
     */
    private loadPreference(): string | null {
        try {
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem('rnx-locale');
            }
        } catch (e) {
            // localStorage not available
        }
        return null;
    }

    /**
     * Clear stored locale preference
     */
    clearPreference(): void {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('rnx-locale');
            }
        } catch (e) {
            // Ignore errors
        }
    }
}

// Singleton instance
export const i18n = new I18n();

/**
 * Convenience function for translations
 * @param key - Translation key
 * @param params - Interpolation parameters
 * @param count - Pluralization count
 * @returns Translated string
 */
export function t(key: string, params?: TranslationParams, count?: number | null): string {
    return i18n.t(key, params, count);
}

/**
 * Set up i18n binding with reactive state
 * Triggers re-render when locale changes
 * @param state - Reactive state object
 */
export function setupI18nBinding(state: any): void {
    i18n.subscribe(() => {
        // Trigger re-render of i18n-bound elements
        if (state && typeof state.subscribe === 'function') {
            const currentVersion = (state as any)._i18nVersion || 0;
            (state as any)._i18nVersion = currentVersion + 1;
        }
    });
}
