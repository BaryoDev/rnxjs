/**
 * Data binding system for rnxJS
 * Processes data-bind attributes and synchronizes DOM with reactive state
 */

// Track subscriptions for cleanup
const bindingSubscriptions = new WeakMap();

/**
 * Get nested property value from object
 * @param {Object} obj - Source object
 * @param {string} path - Dot-notation path (e.g., 'user.email')
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
 * Set nested property value in object
 * Creates intermediate objects if they don't exist
 * @param {Object} obj - Target object
 * @param {string} path - Dot-notation path
 * @param {*} value - Value to set
 */
function setNestedValue(obj, path, value) {
    try {
        const keys = path.split('.');
        const lastKey = keys.pop();

        // Create intermediate objects
        const target = keys.reduce((current, key) => {
            if (typeof current[key] !== 'object' || current[key] === null) {
                current[key] = {};
            }
            return current[key];
        }, obj);

        // Set the final value
        target[lastKey] = value;
    } catch (error) {
        console.error(`[rnxJS] Error setting nested value for path "${path}":`, error);
    }
}

/**
 * Coerce value to appropriate type based on input element
 * @param {HTMLElement} element - Input element
 * @param {*} value - Value to coerce
 * @returns {*} - Coerced value
 */
function coerceValueToType(element, value) {
    const type = element.type;

    try {
        if (type === 'number') {
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
        }

        if (type === 'date' || type === 'datetime-local') {
            return value; // Keep as string for now, can be enhanced
        }

        if (type === 'checkbox') {
            return Boolean(value);
        }

        return value;
    } catch (error) {
        console.error(`[rnxJS] Error coercing value for type "${type}":`, error);
        return value;
    }
}

/**
 * Bind data-bind attributes to reactive state
 * Sets up two-way binding for inputs and one-way binding for display elements
 * @param {HTMLElement} rootElement - Root element to search for data-bind attributes
 * @param {Proxy} state - Reactive state object created by createReactiveState
 */
export function bindData(rootElement = document, state = null) {
    // Validation
    if (!rootElement || typeof rootElement.querySelectorAll !== 'function') {
        console.error('[rnxJS] bindData: rootElement must be a valid DOM element');
        return;
    }

    if (!state) {
        console.warn('[rnxJS] bindData called without a reactive state object. Skipping data binding.');
        return;
    }

    if (typeof state.subscribe !== 'function') {
        console.error('[rnxJS] bindData: state must be a reactive state object with subscribe method');
        return;
    }

    // Track subscriptions for this root element
    if (!bindingSubscriptions.has(rootElement)) {
        bindingSubscriptions.set(rootElement, []);
    }
    const subscriptions = bindingSubscriptions.get(rootElement);

    // Find all elements with data-bind attribute
    const boundElements = rootElement.querySelectorAll('[data-bind]');

    boundElements.forEach(element => {
        const path = element.getAttribute('data-bind');

        if (!path || typeof path !== 'string') {
            console.warn('[rnxJS] data-bind attribute is empty or invalid on element:', element);
            return;
        }

        // Validate path format (basic check)
        if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/.test(path)) {
            console.warn(`[rnxJS] Invalid data-bind path "${path}" on element:`, element);
            return;
        }

        const isInput = element.tagName === 'INPUT' ||
            element.tagName === 'TEXTAREA' ||
            element.tagName === 'SELECT';

        try {
            if (isInput) {
                // Two-way binding for form elements
                const unsubscribe = setupTwoWayBinding(element, state, path);
                if (unsubscribe) {
                    subscriptions.push(unsubscribe);
                }
            } else {
                // One-way binding for display elements
                const unsubscribe = setupOneWayBinding(element, state, path);
                if (unsubscribe) {
                    subscriptions.push(unsubscribe);
                }
            }
        } catch (error) {
            console.error(`[rnxJS] Error setting up binding for path "${path}":`, error);
        }
    });
}

/**
 * Unbind all data bindings for a root element
 * @param {HTMLElement} rootElement - Root element to unbind
 */
export function unbindData(rootElement) {
    if (!bindingSubscriptions.has(rootElement)) {
        return;
    }

    const subscriptions = bindingSubscriptions.get(rootElement);
    subscriptions.forEach(unsubscribe => {
        try {
            unsubscribe();
        } catch (error) {
            console.error('[rnxJS] Error unsubscribing:', error);
        }
    });

    bindingSubscriptions.delete(rootElement);
}

/**
 * Set up two-way binding for input elements
 * @param {HTMLElement} element - Input element
 * @param {Proxy} state - Reactive state
 * @param {string} path - Property path
 * @returns {Function} - Unsubscribe function
 */
function setupTwoWayBinding(element, state, path) {
    const inputType = element.type;

    // Initialize element value from state
    const initialValue = getNestedValue(state, path);
    if (initialValue !== undefined) {
        updateInputValue(element, initialValue, inputType);
    }

    // Listen for user input
    const eventType = (inputType === 'checkbox' || inputType === 'radio') ? 'change' : 'input';

    const inputHandler = (e) => {
        try {
            let value = getInputValue(e.target);
            // Apply type coercion
            value = coerceValueToType(e.target, value);
            setNestedValue(state, path, value);
        } catch (error) {
            console.error(`[rnxJS] Error handling input for path "${path}":`, error);
        }
    };

    element.addEventListener(eventType, inputHandler);

    // Subscribe to state changes
    const unsubscribe = state.subscribe(path, (newValue) => {
        try {
            // Only update if value is different to avoid infinite loops
            const currentValue = getInputValue(element);
            if (currentValue !== newValue) {
                updateInputValue(element, newValue, inputType);
            }
        } catch (error) {
            console.error(`[rnxJS] Error updating input for path "${path}":`, error);
        }
    });

    // Return combined cleanup function
    return () => {
        element.removeEventListener(eventType, inputHandler);
        unsubscribe();
    };
}

/**
 * Set up one-way binding for display elements
 * @param {HTMLElement} element - Display element
 * @param {Proxy} state - Reactive state
 * @param {string} path - Property path
 * @returns {Function} - Unsubscribe function
 */
function setupOneWayBinding(element, state, path) {
    // Initialize element content from state
    const initialValue = getNestedValue(state, path);
    if (initialValue !== undefined) {
        element.textContent = initialValue;
    }

    // Subscribe to state changes
    return state.subscribe(path, (newValue) => {
        try {
            element.textContent = newValue ?? '';
        } catch (error) {
            console.error(`[rnxJS] Error updating display for path "${path}":`, error);
        }
    });
}

/**
 * Get value from input element based on type
 * @param {HTMLElement} element - Input element
 * @returns {*} - Input value (string, boolean, or array for multi-select)
 */
function getInputValue(element) {
    const type = element.type;

    if (type === 'checkbox') {
        return element.checked;
    }

    if (type === 'radio') {
        return element.value;
    }

    if (element.tagName === 'SELECT' && element.multiple) {
        return Array.from(element.selectedOptions).map(opt => opt.value);
    }

    return element.value;
}

/**
 * Update input element value based on type
 * @param {HTMLElement} element - Input element
 * @param {*} value - New value
 * @param {string} type - Input type
 */
function updateInputValue(element, value, type) {
    try {
        if (type === 'checkbox') {
            element.checked = !!value;
        } else if (type === 'radio') {
            element.checked = (element.value === value);
        } else if (element.tagName === 'SELECT' && element.multiple) {
            Array.from(element.options).forEach(opt => {
                opt.selected = Array.isArray(value) && value.includes(opt.value);
            });
        } else {
            element.value = value ?? '';
        }
    } catch (error) {
        console.error('[rnxJS] Error updating input value:', error);
    }
}
