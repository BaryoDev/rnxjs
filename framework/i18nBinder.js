/**
 * i18n Data Binding for rnxJS
 * Automatically translates elements with data-i18n attributes
 */

import { i18n } from '../utils/i18n.ts';

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Source object
 * @param {string} path - Dot notation path
 * @returns {*} - Value at path or undefined
 */
function getNestedValue(obj, path) {
    try {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    } catch (error) {
        return undefined;
    }
}

/**
 * Process i18n bindings in the DOM
 * Binds translations to elements with data-i18n attributes
 *
 * @param {Element|Document} root - Root element to search for bindings
 * @param {Object} state - Reactive state object (optional)
 *
 * @example
 * <h1 data-i18n="pages.home.title"></h1>
 * <p data-i18n="welcome.message" data-i18n-params='{"name": "user.name"}'></p>
 * <span data-i18n="items.count" data-i18n-count="items.length"></span>
 */
export function bindI18n(root, state = null) {
    const elements = root.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const paramsAttr = el.getAttribute('data-i18n-params');
        const countPath = el.getAttribute('data-i18n-count');

        if (!key) {
            console.warn('[rnxJS i18n] data-i18n attribute is empty', el);
            return;
        }

        /**
         * Update element with translation
         */
        const update = () => {
            let params = {};

            // Resolve params from state
            if (paramsAttr && state) {
                try {
                    const paramDefs = JSON.parse(paramsAttr);
                    for (const [paramKey, statePath] of Object.entries(paramDefs)) {
                        params[paramKey] = getNestedValue(state, statePath);
                    }
                } catch (e) {
                    console.warn('[rnxJS i18n] Invalid params:', paramsAttr, e);
                }
            }

            // Get count for pluralization
            const count = countPath && state ? getNestedValue(state, countPath) : null;

            // Add count to params for interpolation
            if (count !== null) {
                params = { ...params, count };
            }

            // Translate and set
            el.textContent = i18n.t(key, params, count);
        };

        // Initial render
        update();

        // Subscribe to locale changes
        const unsubscribeLocale = i18n.subscribe(update);

        // Subscribe to state changes for dynamic params
        const unsubscribeState = [];
        if (state && (paramsAttr || countPath)) {
            // Watch for i18n version changes (triggered by locale change)
            if (typeof state.subscribe === 'function') {
                unsubscribeState.push(state.subscribe('_i18nVersion', update));

                // Also watch specific paths if they're simple
                if (countPath && !countPath.includes('.')) {
                    unsubscribeState.push(state.subscribe(countPath, update));
                }
            }
        }

        // Store cleanup functions on element for later
        el._i18nCleanup = () => {
            unsubscribeLocale();
            unsubscribeState.forEach(fn => fn());
        };
    });
}

/**
 * Unbind i18n from elements
 * Cleans up subscriptions
 *
 * @param {Element|Document} root - Root element containing bindings
 */
export function unbindI18n(root) {
    const elements = root.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
        if (el._i18nCleanup) {
            el._i18nCleanup();
            delete el._i18nCleanup;
        }
    });
}

/**
 * Translate a single element
 * Useful for programmatically creating elements with i18n
 *
 * @param {Element} element - Element to translate
 * @param {string} key - Translation key
 * @param {Object} params - Interpolation parameters
 * @param {number} count - Pluralization count
 */
export function translateElement(element, key, params = {}, count = null) {
    element.textContent = i18n.t(key, params, count);
}
