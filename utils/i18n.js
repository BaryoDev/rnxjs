class I18n {
  constructor() {
    this.locale = "en";
    this.fallbackLocale = "en";
    this.messages = {};
    this.formatters = {};
    this.subscribers = /* @__PURE__ */ new Set();
    this.currency = "USD";
  }
  /**
   * Set current locale
   * @param locale - Locale code (e.g., 'en', 'es', 'fr')
   */
  setLocale(locale) {
    this.locale = locale;
    this.notifySubscribers();
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
    this.savePreference(locale);
  }
  /**
   * Get current locale
   * @returns Current locale code
   */
  getLocale() {
    return this.locale;
  }
  /**
   * Set fallback locale
   * @param locale - Fallback locale code
   */
  setFallbackLocale(locale) {
    this.fallbackLocale = locale;
  }
  /**
   * Set currency for formatting
   * @param currency - Currency code (e.g., 'USD', 'EUR')
   */
  setCurrency(currency) {
    this.currency = currency;
  }
  /**
   * Load messages for a locale
   * @param locale - Locale code
   * @param messages - Messages object or loader function
   */
  async loadMessages(locale, messages) {
    let loadedMessages;
    if (typeof messages === "function") {
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
  getAvailableLocales() {
    return Object.keys(this.messages);
  }
  /**
   * Translate a key
   * @param key - Translation key (dot notation: 'common.buttons.save')
   * @param params - Interpolation parameters
   * @param count - Pluralization count
   * @returns Translated string
   */
  t(key, params = {}, count = null) {
    const message = this.getMessage(key);
    if (message === null || message === void 0) {
      console.warn(`[rnxJS i18n] Missing translation: ${key}`);
      return key;
    }
    let text;
    if (count !== null && typeof message === "object") {
      text = this.pluralize(message, count);
      params = { ...params, count };
    } else if (typeof message === "string") {
      text = message;
    } else {
      console.warn(`[rnxJS i18n] Invalid message format for key: ${key}`);
      return key;
    }
    return this.interpolate(text, params);
  }
  /**
   * Get message from messages object
   * @param key - Translation key (dot notation)
   * @returns Message or null if not found
   * @private
   */
  getMessage(key) {
    const locales = [this.locale, this.fallbackLocale];
    for (const locale of locales) {
      const messages = this.messages[locale];
      if (!messages) continue;
      const value = key.split(".").reduce(
        (obj, k) => obj?.[k],
        messages
      );
      if (value !== void 0) return value;
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
  pluralize(messages, count) {
    if (count === 0 && "zero" in messages) {
      return messages.zero;
    }
    const rules = new Intl.PluralRules(this.locale);
    const rule = rules.select(count);
    return messages[rule] || messages.other || String(messages);
  }
  /**
   * Interpolate parameters into message
   * @param message - Message with placeholders
   * @param params - Interpolation parameters
   * @returns Interpolated message
   * @private
   */
  interpolate(message, params) {
    return message.replace(/\{(\w+)\}/g, (match, key) => {
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
  format(value, type) {
    if (!type) {
      return value;
    }
    if (type === "number") {
      return new Intl.NumberFormat(this.locale).format(value);
    }
    if (type === "currency") {
      return new Intl.NumberFormat(this.locale, {
        style: "currency",
        currency: this.currency
      }).format(value);
    }
    if (type === "date") {
      return new Intl.DateTimeFormat(this.locale).format(new Date(value));
    }
    if (type === "relative") {
      const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: "auto" });
      return rtf.format(value, "day");
    }
    return value;
  }
  /**
   * Subscribe to locale changes
   * @param callback - Called when locale changes
   * @returns Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  /**
   * Notify subscribers of locale change
   * @private
   */
  notifySubscribers() {
    for (const callback of this.subscribers) {
      try {
        callback(this.locale);
      } catch (error) {
        console.error("[rnxJS i18n] Error in locale subscriber:", error);
      }
    }
  }
  /**
   * Initialize i18n from stored or browser preference
   * @param options - Initialization options
   */
  init(options = {}) {
    const { respectBrowserLocale = true } = options;
    const stored = this.loadPreference();
    if (stored && this.messages[stored]) {
      this.setLocale(stored);
      return;
    }
    if (respectBrowserLocale && typeof navigator !== "undefined") {
      const browserLocale = navigator.language.split("-")[0];
      if (this.messages[browserLocale]) {
        this.setLocale(browserLocale);
        return;
      }
    }
    this.setLocale(this.fallbackLocale);
  }
  /**
   * Save locale preference to localStorage
   * @param locale - Locale to save
   * @private
   */
  savePreference(locale) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("rnx-locale", locale);
      }
    } catch (e) {
    }
  }
  /**
   * Load locale preference from localStorage
   * @returns Stored locale or null
   * @private
   */
  loadPreference() {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem("rnx-locale");
      }
    } catch (e) {
    }
    return null;
  }
  /**
   * Clear stored locale preference
   */
  clearPreference() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("rnx-locale");
      }
    } catch (e) {
    }
  }
}
const i18n = new I18n();
function t(key, params, count) {
  return i18n.t(key, params, count);
}
function setupI18nBinding(state) {
  i18n.subscribe(() => {
    if (state && typeof state.subscribe === "function") {
      const currentVersion = state._i18nVersion || 0;
      state._i18nVersion = currentVersion + 1;
    }
  });
}
export {
  i18n,
  setupI18nBinding,
  t
};
