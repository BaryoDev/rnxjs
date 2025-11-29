/**
 * Data binding system for rnxJS
 * Processes data-bind attributes and synchronizes DOM with reactive state
 */

/**
 * Get nested property value from object
 * @param {Object} obj - Source object
 * @param {string} path - Dot-notation path (e.g., 'user.email')
 * @returns {*} - Property value or undefined
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Set nested property value in object
 * Creates intermediate objects if they don't exist
 * @param {Object} obj - Target object
 * @param {string} path - Dot-notation path
 * @param {*} value - Value to set
 */
function setNestedValue(obj, path, value) {
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
}

/**
 * Bind data-bind attributes to reactive state
 * Sets up two-way binding for inputs and one-way binding for display elements
 * @param {HTMLElement} rootElement - Root element to search for data-bind attributes
 * @param {Proxy} state - Reactive state object created by createReactiveState
 */
export function bindData(rootElement = document, state = null) {
    if (!state) {
        console.warn('⚠️ bindData called without a reactive state object. Skipping data binding.');
        return;
    }

    // Find all elements with data-bind attribute
    const boundElements = rootElement.querySelectorAll('[data-bind]');

    boundElements.forEach(element => {
        const path = element.getAttribute('data-bind');

        if (!path) {
            console.warn('⚠️ data-bind attribute is empty on element:', element);
            return;
        }

        const isInput = element.tagName === 'INPUT' ||
            element.tagName === 'TEXTAREA' ||
            element.tagName === 'SELECT';

        if (isInput) {
            // Two-way binding for form elements
            setupTwoWayBinding(element, state, path);
        } else {
            // One-way binding for display elements
            setupOneWayBinding(element, state, path);
        }
    });
}

/**
 * Set up two-way binding for input elements
 * @param {HTMLElement} element - Input element
 * @param {Proxy} state - Reactive state
 * @param {string} path - Property path
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

    element.addEventListener(eventType, (e) => {
        const value = getInputValue(e.target);
        setNestedValue(state, path, value);
    });

    // Subscribe to state changes
    state.subscribe(path, (newValue) => {
        // Only update if value is different to avoid infinite loops
        const currentValue = getInputValue(element);
        if (currentValue !== newValue) {
            updateInputValue(element, newValue, inputType);
        }
    });
}

/**
 * Set up one-way binding for display elements
 * @param {HTMLElement} element - Display element
 * @param {Proxy} state - Reactive state
 * @param {string} path - Property path
 */
function setupOneWayBinding(element, state, path) {
    // Initialize element content from state
    const initialValue = getNestedValue(state, path);
    if (initialValue !== undefined) {
        element.textContent = initialValue;
    }

    // Subscribe to state changes
    state.subscribe(path, (newValue) => {
        element.textContent = newValue ?? '';
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
}
