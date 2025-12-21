/**
 * Accessibility utilities for rnxJS
 * Provides helpers for WCAG 2.1 AA compliance
 */

/**
 * Check if an element is focusable
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - True if element can receive focus
 */
export function isFocusable(element) {
    if (!element || element.nodeType !== 1) return false;
    if (element.disabled) return false;
    if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) return false;

    const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    if (focusableTags.includes(element.tagName)) {
        // Links must have href to be focusable
        if (element.tagName === 'A' && !element.href) return false;
        return true;
    }

    return element.hasAttribute('tabindex') && element.tabIndex >= 0;
}

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement[]} - Array of focusable elements
 */
export function getFocusableElements(container) {
    const selector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
    ].join(', ');

    const elements = container.querySelectorAll(selector);
    return Array.from(elements).filter(isFocusable);
}

/**
 * Get the first focusable element in a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement|null} - First focusable element or null
 */
export function getFirstFocusable(container) {
    const focusable = getFocusableElements(container);
    return focusable.length > 0 ? focusable[0] : null;
}

/**
 * Get the last focusable element in a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement|null} - Last focusable element or null
 */
export function getLastFocusable(container) {
    const focusable = getFocusableElements(container);
    return focusable.length > 0 ? focusable[focusable.length - 1] : null;
}

/**
 * Create a focus trap for modal dialogs
 * @param {HTMLElement} container - Container to trap focus within
 * @returns {Object} - Focus trap controller with activate/deactivate methods
 */
export function createFocusTrap(container) {
    let previouslyFocused = null;
    let isActive = false;

    function handleKeyDown(e) {
        if (e.key !== 'Tab' || !isActive) return;

        const focusable = getFocusableElements(container);
        if (focusable.length === 0) return;

        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];

        // Shift + Tab
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        }
        // Tab
        else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    return {
        /**
         * Activate the focus trap
         * @param {HTMLElement} [initialFocus] - Element to focus initially
         */
        activate(initialFocus = null) {
            if (isActive) return;

            isActive = true;
            previouslyFocused = document.activeElement;

            // Listen for Tab key
            container.addEventListener('keydown', handleKeyDown);

            // Set initial focus
            requestAnimationFrame(() => {
                if (initialFocus && initialFocus.focus) {
                    initialFocus.focus();
                } else {
                    const first = getFirstFocusable(container);
                    if (first) first.focus();
                }
            });
        },

        /**
         * Deactivate the focus trap and restore previous focus
         * @param {boolean} [returnFocus=true] - Whether to return focus
         */
        deactivate(returnFocus = true) {
            if (!isActive) return;

            isActive = false;
            container.removeEventListener('keydown', handleKeyDown);

            if (returnFocus && previouslyFocused && previouslyFocused.focus) {
                requestAnimationFrame(() => {
                    previouslyFocused.focus();
                });
            }
        },

        /**
         * Check if trap is active
         * @returns {boolean}
         */
        isActive() {
            return isActive;
        }
    };
}

/**
 * Announce a message to screen readers
 * @param {string} message - Message to announce
 * @param {string} [priority='polite'] - 'polite' or 'assertive'
 * @param {number} [duration=1000] - How long to keep announcement in DOM (ms)
 */
export function announce(message, priority = 'polite', duration = 1000) {
    if (!message) return;

    const announcer = document.createElement('div');
    announcer.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'rnx-sr-only';
    announcer.textContent = message;

    // Add screen reader only styles
    Object.assign(announcer.style, {
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
    });

    document.body.appendChild(announcer);

    setTimeout(() => {
        if (announcer.parentNode) {
            document.body.removeChild(announcer);
        }
    }, duration);
}

/**
 * Create a skip link for keyboard navigation
 * @param {string} targetId - ID of target element to skip to
 * @param {string} [text='Skip to main content'] - Link text
 * @returns {HTMLAnchorElement} - Skip link element
 */
export function createSkipLink(targetId, text = 'Skip to main content') {
    const link = document.createElement('a');
    link.href = `#${targetId}`;
    link.className = 'rnx-skip-link';
    link.textContent = text;

    // Skip link styles (visible on focus)
    Object.assign(link.style, {
        position: 'absolute',
        left: '-10000px',
        top: '0',
        background: '#000',
        color: '#fff',
        padding: '0.5rem 1rem',
        textDecoration: 'none',
        zIndex: '10000'
    });

    // Make visible on focus
    link.addEventListener('focus', () => {
        link.style.left = '0';
    });

    link.addEventListener('blur', () => {
        link.style.left = '-10000px';
    });

    return link;
}

/**
 * Set up accessible click handlers for elements
 * Makes non-button elements keyboard accessible
 * @param {HTMLElement} element - Element to make accessible
 * @param {Function} handler - Click handler function
 * @param {string[]} [keys=['Enter', ' ']] - Keys that trigger click
 */
export function setupAccessibleClick(element, handler, keys = ['Enter', ' ']) {
    // Add click handler
    element.addEventListener('click', handler);

    // Make focusable if not already
    if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
    }

    // Add keyboard handler
    element.addEventListener('keydown', (e) => {
        if (keys.includes(e.key)) {
            e.preventDefault();
            handler(e);
        }
    });

    // Add role if not interactive element
    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    if (!interactiveTags.includes(element.tagName)) {
        element.setAttribute('role', 'button');
    }
}

/**
 * Manage ARIA expanded state for disclosure widgets
 * @param {HTMLElement} trigger - Trigger element (button)
 * @param {HTMLElement} target - Target element to show/hide
 * @param {boolean} [initiallyExpanded=false] - Initial state
 * @returns {Object} - Controller with toggle, expand, collapse methods
 */
export function createDisclosureWidget(trigger, target, initiallyExpanded = false) {
    let isExpanded = initiallyExpanded;

    // Set up ARIA attributes
    const targetId = target.id || `disclosure-${Math.random().toString(36).substr(2, 9)}`;
    target.id = targetId;
    trigger.setAttribute('aria-controls', targetId);
    trigger.setAttribute('aria-expanded', String(isExpanded));

    // Set initial visibility
    target.hidden = !isExpanded;

    function setExpanded(expanded) {
        isExpanded = expanded;
        trigger.setAttribute('aria-expanded', String(isExpanded));
        target.hidden = !isExpanded;

        // Announce state change
        announce(
            `${trigger.textContent || 'Section'} ${isExpanded ? 'expanded' : 'collapsed'}`,
            'polite'
        );
    }

    return {
        toggle() {
            setExpanded(!isExpanded);
        },
        expand() {
            setExpanded(true);
        },
        collapse() {
            setExpanded(false);
        },
        isExpanded() {
            return isExpanded;
        }
    };
}

/**
 * Set unique ID on element if it doesn't have one
 * @param {HTMLElement} element - Element to ensure has ID
 * @param {string} [prefix='rnx'] - Prefix for generated ID
 * @returns {string} - The element's ID
 */
export function ensureId(element, prefix = 'rnx') {
    if (!element.id) {
        element.id = `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return element.id;
}

/**
 * Create ARIA label relationship between elements
 * @param {HTMLElement} labelElement - Labeling element
 * @param {HTMLElement} targetElement - Element being labeled
 */
export function createAriaLabel(labelElement, targetElement) {
    const labelId = ensureId(labelElement, 'label');
    targetElement.setAttribute('aria-labelledby', labelId);
}

/**
 * Create ARIA description relationship between elements
 * @param {HTMLElement} descElement - Describing element
 * @param {HTMLElement} targetElement - Element being described
 */
export function createAriaDescription(descElement, targetElement) {
    const descId = ensureId(descElement, 'desc');
    targetElement.setAttribute('aria-describedby', descId);
}
