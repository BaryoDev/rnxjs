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
 * Validate a value against a set of rules
 * @param {*} value - Value to validate
 * @param {string} rules - Pipe-separated rules (e.g., "required|email|min:3")
 * @returns {string|null} - Error message or null if valid
 */
function validateField(value, rules) {
    if (!rules) return null;

    const ruleList = rules.split('|');

    for (const rule of ruleList) {
        const [name, param] = rule.split(':');

        if (name === 'required') {
            if (value === null || value === undefined || value === '') {
                return 'This field is required';
            }
        }

        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(String(value))) {
                return 'Invalid email address';
            }
        }

        if (name === 'numeric') {
            if (value && isNaN(Number(value))) {
                return 'Must be a number';
            }
        }

        if (name === 'min') {
            const min = parseFloat(param);
            if (typeof value === 'string' && value.length < min) {
                return `Must be at least ${min} characters`;
            }
            if (typeof value === 'number' && value < min) {
                return `Must be at least ${min}`;
            }
        }

        if (name === 'max') {
            const max = parseFloat(param);
            if (typeof value === 'string' && value.length > max) {
                return `Must be no more than ${max} characters`;
            }
            if (typeof value === 'number' && value > max) {
                return `Must be no more than ${max}`;
            }
        }

        if (name === 'pattern') {
            try {
                const regex = new RegExp(param);
                if (value && !regex.test(String(value))) {
                    return 'Invalid format';
                }
            } catch (e) {
                console.warn('[rnxJS] Invalid regex pattern in validation rule:', param);
            }
        }
    }

    return null;
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

    // Initialize errors object in state if it doesn't exist
    if (!state.errors) {
        try {
            state.errors = {};
        } catch (e) {
            // State might be sealed or not extensible, proceed without validation support if so
            console.warn('[rnxJS] Could not initialize state.errors. Validation may not work.');
        }
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
    const rules = element.getAttribute('data-rule');

    // Initialize element value from state
    const initialValue = getNestedValue(state, path);
    if (initialValue !== undefined) {
        updateInputValue(element, initialValue, inputType);
        // Initial validation
        if (rules && state.errors) {
            const error = validateField(initialValue, rules);
            setNestedValue(state.errors, path, error || '');
        }
    }

    // Listen for user input
    const eventType = (inputType === 'checkbox' || inputType === 'radio') ? 'change' : 'input';

    const inputHandler = (e) => {
        try {
            // Flag element as updating to prevent recursive loop from state subscription
            element._isUpdating = true;

            let value = getInputValue(e.target);
            // Apply type coercion
            value = coerceValueToType(e.target, value);
            setNestedValue(state, path, value);

            // Validation
            if (rules && state.errors) {
                const error = validateField(value, rules);
                setNestedValue(state.errors, path, error || '');
            }
        } catch (error) {
            console.error(`[rnxJS] Error handling input for path "${path}":`, error);
        } finally {
            element._isUpdating = false;
        }
    };

    element.addEventListener(eventType, inputHandler);

    // Subscribe to state changes
    const unsubscribe = state.subscribe(path, (newValue) => {
        try {
            // Only update if value is different AND element is not currently updating itself
            const currentValue = getInputValue(element);
            if (!element._isUpdating && currentValue !== newValue) {
                updateInputValue(element, newValue, inputType);

                // Re-validate on external state change
                if (rules && state.errors) {
                    const error = validateField(newValue, rules);
                    setNestedValue(state.errors, path, error || '');
                }
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
