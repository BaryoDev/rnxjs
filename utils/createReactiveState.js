/**
 * Creates a reactive state object using ES6 Proxy
 * Automatically notifies subscribers when state changes
 * @param {Object} initialState - Initial state object
 * @returns {Proxy} - Reactive state proxy with subscribe/unsubscribe methods
 */
export function createReactiveState(initialState = {}) {
    const subscribers = new Map();

    /**
     * Subscribe to changes on a specific property path
     * @param {string} path - Dot-notation path (e.g., 'user.email')
     * @param {Function} callback - Called with new value when path changes
     * @returns {Function} - Unsubscribe function
     */
    function subscribe(path, callback) {
        if (!subscribers.has(path)) {
            subscribers.set(path, new Set());
        }
        subscribers.get(path).add(callback);

        // Return unsubscribe function
        return () => {
            const pathSubscribers = subscribers.get(path);
            if (pathSubscribers) {
                pathSubscribers.delete(callback);
            }
        };
    }

    /**
     * Notify all subscribers for a given path
     * @param {string} path - Property path that changed
     * @param {*} value - New value
     */
    function notify(path, value) {
        // Notify exact path subscribers
        if (subscribers.has(path)) {
            subscribers.get(path).forEach(callback => callback(value));
        }

        // Notify parent path subscribers (e.g., 'user' when 'user.email' changes)
        const parts = path.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPath = parts.slice(0, i).join('.');
            if (subscribers.has(parentPath)) {
                const parentValue = getNestedValue(state, parentPath);
                subscribers.get(parentPath).forEach(callback => callback(parentValue));
            }
        }
    }

    /**
     * Get nested property value from object
     * @param {Object} obj - Source object
     * @param {string} path - Dot-notation path
     * @returns {*} - Property value or undefined
     */
    function getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Create reactive proxy for nested objects
     * @param {Object} target - Object to make reactive
     * @param {string} basePath - Current path prefix
     * @returns {Proxy} - Reactive proxy
     */
    function createReactiveProxy(target, basePath = '') {
        // Handle non-object values
        if (typeof target !== 'object' || target === null) {
            return target;
        }

        // Recursively wrap nested objects
        const handler = {
            get(obj, prop) {
                const value = obj[prop];

                // FIX: Skip path construction for Symbols
                if (typeof prop !== 'string') {
                    return value;
                }

                const currentPath = basePath ? `${basePath}.${prop}` : prop;

                // Return nested proxy for objects
                if (typeof value === 'object' && value !== null) {
                    return createReactiveProxy(value, currentPath);
                }

                return value;
            },

            set(obj, prop, value) {
                // FIX: Skip path construction for Symbols
                if (typeof prop !== 'string') {
                    obj[prop] = value;
                    return true;
                }

                const oldValue = obj[prop];
                const currentPath = basePath ? `${basePath}.${prop}` : prop;

                // Only update and notify if value actually changed
                if (oldValue !== value) {
                    obj[prop] = value;
                    notify(currentPath, value);
                }

                return true;
            }
        };

        return new Proxy(target, handler);
    }

    // Create the reactive state
    const state = createReactiveProxy(initialState);

    // Attach utility methods to the state object
    Object.defineProperty(state, 'subscribe', {
        value: subscribe,
        enumerable: false,
        writable: false
    });

    Object.defineProperty(state, 'getNestedValue', {
        value: getNestedValue,
        enumerable: false,
        writable: false
    });

    return state;
}
