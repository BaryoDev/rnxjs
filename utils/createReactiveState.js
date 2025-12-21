/**
 * Creates a reactive state object using ES6 Proxy
 * Automatically notifies subscribers when state changes
 * @param {Object} initialState - Initial state object
 * @returns {Proxy} - Reactive state proxy with subscribe/unsubscribe methods
 */
export function createReactiveState(initialState = {}) {
    // Input validation
    if (typeof initialState !== 'object' || initialState === null) {
        throw new TypeError('[rnxJS] createReactiveState: initialState must be an object');
    }

    const subscribers = new Map();
    const proxyCache = new WeakMap(); // Cache proxies to avoid recreating them
    const visitedObjects = new WeakSet(); // Prevent circular reference infinite loops
    const unsubscribeFunctions = new Set(); // Track all unsubscribe functions for cleanup

    // Update batching state
    let pendingNotifications = new Map();
    let batchScheduled = false;

    /**
     * Subscribe to changes on a specific property path
     * @param {string} path - Dot-notation path (e.g., 'user.email')
     * @param {Function} callback - Called with new value when path changes
     * @returns {Function} - Unsubscribe function
     */
    function subscribe(path, callback) {
        if (typeof path !== 'string' || !path) {
            console.warn('[rnxJS] subscribe: path must be a non-empty string');
            return () => { };
        }
        if (typeof callback !== 'function') {
            console.warn('[rnxJS] subscribe: callback must be a function');
            return () => { };
        }

        if (!subscribers.has(path)) {
            subscribers.set(path, new Set());
        }
        subscribers.get(path).add(callback);

        // Return unsubscribe function
        const unsubscribe = () => {
            const pathSubscribers = subscribers.get(path);
            if (pathSubscribers) {
                pathSubscribers.delete(callback);
                if (pathSubscribers.size === 0) {
                    subscribers.delete(path);
                }
            }
            unsubscribeFunctions.delete(unsubscribe);
        };

        unsubscribeFunctions.add(unsubscribe);
        return unsubscribe;
    }

    /**
     * Unsubscribe all listeners
     */
    function unsubscribeAll() {
        subscribers.clear();
        unsubscribeFunctions.clear();
    }

    /**
     * Destroy the reactive state and cleanup all resources
     */
    function destroy() {
        unsubscribeAll();
        proxyCache.clear?.(); // Clear cache if supported
    }

    /**
     * Queue a notification to be processed in the next microtask
     * Also queue parent path notifications to avoid redundant lookups
     * @param {string} path - Property path that changed
     * @param {*} value - New value
     */
    function queueNotification(path, value) {
        // Store the notification for the exact path
        pendingNotifications.set(path, value);

        // Also queue parent path notifications
        // (will be computed at flush time with latest values)
        const parts = path.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPath = parts.slice(0, i).join('.');
            // Mark parent as needing update (value will be recomputed at flush)
            if (!pendingNotifications.has(parentPath)) {
                pendingNotifications.set(parentPath, null); // null means "compute from state"
            }
        }

        // Schedule batch if not already scheduled
        if (!batchScheduled) {
            batchScheduled = true;
            queueMicrotask(flushNotifications);
        }
    }

    /**
     * Flush all pending notifications
     * This is called in a microtask to batch multiple updates
     */
    function flushNotifications() {
        const notifications = pendingNotifications;
        pendingNotifications = new Map();
        batchScheduled = false;

        // Process all queued notifications
        for (const [path, value] of notifications) {
            notifyImmediate(path, value);
        }
    }

    /**
     * Synchronously flush all pending notifications
     * Useful for testing or when immediate updates are required
     */
    function flushSync() {
        if (batchScheduled) {
            flushNotifications();
        }
    }

    /**
     * Notify all subscribers for a given path (immediate, no batching)
     * @param {string} path - Property path that changed
     * @param {*} value - New value (null means compute from state)
     */
    function notifyImmediate(path, value) {
        try {
            // Notify exact path subscribers
            if (subscribers.has(path)) {
                // If value is null, compute it from state
                const actualValue = value === null ? getNestedValue(state, path) : value;

                subscribers.get(path).forEach(callback => {
                    try {
                        callback(actualValue);
                    } catch (error) {
                        console.error(`[rnxJS] Error in subscriber for path "${path}":`, error);
                    }
                });
            }
        } catch (error) {
            console.error(`[rnxJS] Error notifying subscribers for path "${path}":`, error);
        }
    }

    /**
     * Get nested property value from object
     * @param {Object} obj - Source object
     * @param {string} path - Dot-notation path
     * @returns {*} - Property value or undefined
     */
    function getNestedValue(obj, path) {
        try {
            return path.split('.').reduce((current, key) => current?.[key], obj);
        } catch (error) {
            console.error(`[rnxJS] Error getting nested value for path "${path}":`, error);
            return undefined;
        }
    }

    /**
     * Array methods that mutate the array - need to trigger reactivity
     */
    const arrayMutatorMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

    /**
     * Create reactive proxy for nested objects and arrays
     * @param {Object} target - Object to make reactive
     * @param {string} basePath - Current path prefix
     * @returns {Proxy} - Reactive proxy
     */
    function createReactiveProxy(target, basePath = '') {
        // Handle non-object values
        if (typeof target !== 'object' || target === null) {
            return target;
        }

        // Check if we've already created a proxy for this object (performance optimization)
        if (proxyCache.has(target)) {
            return proxyCache.get(target);
        }

        // Prevent circular reference infinite loops
        if (visitedObjects.has(target)) {
            console.warn(`[rnxJS] Circular reference detected at path "${basePath}". Skipping proxy creation.`);
            return target;
        }
        visitedObjects.add(target);

        // Special handling for arrays
        const isArray = Array.isArray(target);

        // Recursively wrap nested objects
        const handler = {
            get(obj, prop) {
                const value = obj[prop];

                // Skip for Symbols and built-in properties
                if (typeof prop !== 'string') {
                    return value;
                }

                const currentPath = basePath ? `${basePath}.${prop}` : prop;

                // Wrap array mutator methods to trigger reactivity
                if (isArray && arrayMutatorMethods.includes(prop)) {
                    return function (...args) {
                        const result = Array.prototype[prop].apply(obj, args);
                        // Queue notification that the array changed
                        queueNotification(basePath, obj);
                        return result;
                    };
                }

                // Return nested proxy for objects and arrays
                if (typeof value === 'object' && value !== null) {
                    return createReactiveProxy(value, currentPath);
                }

                return value;
            },

            set(obj, prop, value) {
                // Skip for Symbols
                if (typeof prop !== 'string') {
                    obj[prop] = value;
                    return true;
                }

                const oldValue = obj[prop];
                const currentPath = basePath ? `${basePath}.${prop}` : prop;

                // Only update and notify if value actually changed
                if (oldValue !== value) {
                    obj[prop] = value;
                    queueNotification(currentPath, value);
                }

                return true;
            }
        };

        const proxy = new Proxy(target, handler);
        proxyCache.set(target, proxy);

        return proxy;
    }

    // Create the reactive state
    const state = createReactiveProxy(initialState);

    // Attach utility methods to the state object
    Object.defineProperty(state, 'subscribe', {
        value: subscribe,
        enumerable: false,
        writable: false,
        configurable: false
    });

    Object.defineProperty(state, 'getNestedValue', {
        value: getNestedValue,
        enumerable: false,
        writable: false,
        configurable: false
    });

    Object.defineProperty(state, '$unsubscribeAll', {
        value: unsubscribeAll,
        enumerable: false,
        writable: false,
        configurable: false
    });

    Object.defineProperty(state, '$destroy', {
        value: destroy,
        enumerable: false,
        writable: false,
        configurable: false
    });

    Object.defineProperty(state, '$flushSync', {
        value: flushSync,
        enumerable: false,
        writable: false,
        configurable: false
    });

    return state;
}
