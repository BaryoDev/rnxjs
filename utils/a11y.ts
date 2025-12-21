/**
 * Accessibility utilities for rnxJS
 * Provides helpers for WCAG 2.1 AA compliance
 */

/**
 * Focus trap controller interface
 */
export interface FocusTrap {
    activate(initialFocus?: HTMLElement | null): void;
    deactivate(returnFocus?: boolean): void;
    isActive(): boolean;
}

/**
 * Disclosure widget controller interface
 */
export interface DisclosureWidget {
    toggle(): void;
    expand(): void;
    collapse(): void;
    isExpanded(): boolean;
}

/**
 * Announcement priority type
 */
export type AnnouncementPriority = 'polite' | 'assertive';

/**
 * Check if an element is focusable
 * @param element - Element to check
 * @returns True if element can receive focus
 */
export function isFocusable(element: HTMLElement | null): boolean {
    if (!element || element.nodeType !== 1) return false;

    // Check disabled state for form elements
    if ('disabled' in element && (element as HTMLInputElement | HTMLButtonElement).disabled) {
        return false;
    }

    if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) return false;

    const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    if (focusableTags.includes(element.tagName)) {
        // Links must have href to be focusable
        if (element.tagName === 'A' && !(element as HTMLAnchorElement).href) return false;
        return true;
    }

    return element.hasAttribute('tabindex') && element.tabIndex >= 0;
}

/**
 * Get all focusable elements within a container
 * @param container - Container element
 * @returns Array of focusable elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
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
    return Array.from(elements).filter((el): el is HTMLElement =>
        el instanceof HTMLElement && isFocusable(el)
    );
}

/**
 * Get the first focusable element in a container
 * @param container - Container element
 * @returns First focusable element or null
 */
export function getFirstFocusable(container: HTMLElement): HTMLElement | null {
    const focusable = getFocusableElements(container);
    return focusable.length > 0 ? focusable[0] : null;
}

/**
 * Get the last focusable element in a container
 * @param container - Container element
 * @returns Last focusable element or null
 */
export function getLastFocusable(container: HTMLElement): HTMLElement | null {
    const focusable = getFocusableElements(container);
    return focusable.length > 0 ? focusable[focusable.length - 1] : null;
}

/**
 * Create a focus trap for modal dialogs
 * @param container - Container to trap focus within
 * @returns Focus trap controller with activate/deactivate methods
 */
export function createFocusTrap(container: HTMLElement): FocusTrap {
    let previouslyFocused: HTMLElement | null = null;
    let isActive = false;

    function handleKeyDown(e: KeyboardEvent): void {
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
         * @param initialFocus - Element to focus initially
         */
        activate(initialFocus: HTMLElement | null = null): void {
            if (isActive) return;

            isActive = true;
            previouslyFocused = document.activeElement as HTMLElement;

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
         * @param returnFocus - Whether to return focus
         */
        deactivate(returnFocus: boolean = true): void {
            if (!isActive) return;

            isActive = false;
            container.removeEventListener('keydown', handleKeyDown);

            if (returnFocus && previouslyFocused && previouslyFocused.focus) {
                requestAnimationFrame(() => {
                    previouslyFocused!.focus();
                });
            }
        },

        /**
         * Check if trap is active
         * @returns Active state
         */
        isActive(): boolean {
            return isActive;
        }
    };
}

/**
 * Announce a message to screen readers
 * @param message - Message to announce
 * @param priority - 'polite' or 'assertive'
 * @param duration - How long to keep announcement in DOM (ms)
 */
export function announce(
    message: string,
    priority: AnnouncementPriority = 'polite',
    duration: number = 1000
): void {
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
 * @param targetId - ID of target element to skip to
 * @param text - Link text
 * @returns Skip link element
 */
export function createSkipLink(
    targetId: string,
    text: string = 'Skip to main content'
): HTMLAnchorElement {
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
 * @param element - Element to make accessible
 * @param handler - Click handler function
 * @param keys - Keys that trigger click
 */
export function setupAccessibleClick(
    element: HTMLElement,
    handler: (e: Event) => void,
    keys: string[] = ['Enter', ' ']
): void {
    // Add click handler
    element.addEventListener('click', handler);

    // Make focusable if not already
    if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
    }

    // Add keyboard handler
    element.addEventListener('keydown', (e: KeyboardEvent) => {
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
 * @param trigger - Trigger element (button)
 * @param target - Target element to show/hide
 * @param initiallyExpanded - Initial state
 * @returns Controller with toggle, expand, collapse methods
 */
export function createDisclosureWidget(
    trigger: HTMLElement,
    target: HTMLElement,
    initiallyExpanded: boolean = false
): DisclosureWidget {
    let isExpanded = initiallyExpanded;

    // Set up ARIA attributes
    const targetId = target.id || `disclosure-${Math.random().toString(36).substr(2, 9)}`;
    target.id = targetId;
    trigger.setAttribute('aria-controls', targetId);
    trigger.setAttribute('aria-expanded', String(isExpanded));

    // Set initial visibility
    target.hidden = !isExpanded;

    function setExpanded(expanded: boolean): void {
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
        toggle(): void {
            setExpanded(!isExpanded);
        },
        expand(): void {
            setExpanded(true);
        },
        collapse(): void {
            setExpanded(false);
        },
        isExpanded(): boolean {
            return isExpanded;
        }
    };
}

/**
 * Set unique ID on element if it doesn't have one
 * @param element - Element to ensure has ID
 * @param prefix - Prefix for generated ID
 * @returns The element's ID
 */
export function ensureId(element: HTMLElement, prefix: string = 'rnx'): string {
    if (!element.id) {
        element.id = `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return element.id;
}

/**
 * Create ARIA label relationship between elements
 * @param labelElement - Labeling element
 * @param targetElement - Element being labeled
 */
export function createAriaLabel(labelElement: HTMLElement, targetElement: HTMLElement): void {
    const labelId = ensureId(labelElement, 'label');
    targetElement.setAttribute('aria-labelledby', labelId);
}

/**
 * Create ARIA description relationship between elements
 * @param descElement - Describing element
 * @param targetElement - Element being described
 */
export function createAriaDescription(descElement: HTMLElement, targetElement: HTMLElement): void {
    const descId = ensureId(descElement, 'desc');
    targetElement.setAttribute('aria-describedby', descId);
}
