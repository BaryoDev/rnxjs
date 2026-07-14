/**
 * ErrorBoundary Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Catches JavaScript errors in child components and displays fallback UI.
 */

import { createComponent } from '../../utils/createComponent.js';
import { errorTracking } from '../../utils/errorTracking.ts';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Create an error boundary component
 *
 * @param {Object} options - Configuration options
 * @param {HTMLElement|HTMLElement[]} options.children - Child elements to wrap
 * @param {Function} [options.fallback] - Function that returns fallback UI HTML (receives error and errorInfo)
 * @param {Function} [options.onError] - Callback when error is caught (receives error and errorInfo)
 * @param {boolean} [options.trackErrors=true] - Whether to send errors to error tracking
 * @param {string} [options.componentName] - Name of the component for error context
 * @returns {HTMLElement} Error boundary component
 *
 * @example
 * const boundary = ErrorBoundary({
 *   children: myComponent,
 *   fallback: (error) => `
 *     <div class="error">
 *       <h2>Something went wrong</h2>
 *       <p>${error.message}</p>
 *     </div>
 *   `,
 *   onError: (error, errorInfo) => {
 *     console.error('Error caught:', error, errorInfo);
 *   }
 * });
 */
export function ErrorBoundary(options = {}) {
    const {
        children,
        fallback,
        onError,
        trackErrors = true,
        componentName = 'ErrorBoundary'
    } = options;

    if (!children) {
        throw new TypeError('[rnxJS] ErrorBoundary: children is required');
    }

    // Default fallback UI
    const defaultFallback = (error) => {
        const containerClass = cn(
            resolveClasses('errorboundary'),
            resolvePartClasses('errorboundary', 'container'),
            'rnx-error-boundary'
        );
        const titleClass = cn(
            resolvePartClasses('errorboundary', 'title'),
            'rnx-error-boundary-title'
        );
        const messageClass = cn(
            resolvePartClasses('errorboundary', 'message'),
            'rnx-error-boundary-message'
        );
        const stackClass = cn(
            resolvePartClasses('errorboundary', 'stack'),
            'rnx-error-boundary-stack'
        );

        return `
            <div class="${containerClass}" role="alert">
                <h3 class="${titleClass}">This section failed to load</h3>
                <p class="${messageClass}">Reload the page to try again. If the problem continues, contact support.</p>
                <details style="cursor: pointer;">
                    <summary>Error details</summary>
                    <pre class="${stackClass}" style="overflow-x: auto;">${escapeHtml(error?.message || 'Unknown error')}\n\n${escapeHtml(error?.stack || '')}</pre>
                </details>
            </div>
        `;
    };

    const fallbackFn = fallback || defaultFallback;

    // Component state
    let hasError = false;
    let caughtError = null;
    let errorInfo = null;

    /**
     * Handle caught errors
     */
    const handleError = (error, info = {}) => {
        hasError = true;
        caughtError = error;
        errorInfo = {
            componentName,
            componentStack: error.stack,
            ...info
        };

        // Track error
        if (trackErrors && errorTracking.isEnabled()) {
            errorTracking.captureError(error, errorInfo);
        }

        // Call user error handler
        if (onError && typeof onError === 'function') {
            try {
                onError(error, errorInfo);
            } catch (handlerError) {
                console.error('[rnxJS] Error in ErrorBoundary onError handler:', handlerError);
            }
        }

        // Re-render with fallback
        component.setState({ hasError: true });
    };

    /**
     * Wrap child element with error catching
     */
    const wrapWithErrorCatching = (child) => {
        if (!child) return null;

        // Store original event listeners
        const originalAddEventListener = child.addEventListener;

        // Override addEventListener to catch errors in event handlers
        child.addEventListener = function(type, listener, options) {
            const wrappedListener = function(event) {
                try {
                    return listener.call(this, event);
                } catch (error) {
                    handleError(error, {
                        metadata: {
                            eventType: type,
                            target: event.target?.tagName
                        }
                    });
                }
            };

            return originalAddEventListener.call(this, type, wrappedListener, options);
        };

        return child;
    };

    /**
     * Template function
     */
    const template = (state) => {
        if (state.hasError && caughtError) {
            return fallbackFn(caughtError, errorInfo);
        }

        return '<div class="rnx-error-boundary-wrapper" data-ref="wrapper"></div>';
    };

    // Create the component
    const component = createComponent(template, { hasError: false });

    // Setup error catching
    component.useEffect((el) => {
        const wrapper = el.refs.wrapper;
        if (!wrapper || hasError) return;

        try {
            // Append children
            const childElements = Array.isArray(children) ? children : [children];

            childElements.forEach(child => {
                if (child) {
                    const wrappedChild = wrapWithErrorCatching(child);
                    wrapper.appendChild(wrappedChild);
                }
            });

            // Global error handler for this boundary
            const handleGlobalError = (event) => {
                // Check if error originated from a child element
                if (wrapper.contains(event.target)) {
                    event.preventDefault();
                    handleError(event.error || new Error(event.message), {
                        metadata: {
                            type: 'runtime',
                            filename: event.filename,
                            lineno: event.lineno,
                            colno: event.colno
                        }
                    });
                }
            };

            window.addEventListener('error', handleGlobalError, true);

            return () => {
                window.removeEventListener('error', handleGlobalError, true);
            };
        } catch (error) {
            handleError(error, {
                metadata: {
                    type: 'render',
                    phase: 'mount'
                }
            });
        }
    });

    // Add utility methods
    component.resetError = () => {
        hasError = false;
        caughtError = null;
        errorInfo = null;
        component.setState({ hasError: false });
    };

    component.getError = () => ({
        hasError,
        error: caughtError,
        errorInfo
    });

    return component;
}

/**
 * Create multiple error boundaries with shared configuration
 */
export function createErrorBoundaries(config) {
    return (children) => ErrorBoundary({
        ...config,
        children
    });
}
