/**
 * ErrorState Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Error display with optional details and retry action.
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml, escapeAttribute } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Create an error state display
 *
 * @param {Object} [options] - Configuration options
 * @param {string} [options.icon='exclamation-triangle'] - Bootstrap icon name
 * @param {string} [options.title='Something went wrong'] - Title text
 * @param {string} [options.message] - Descriptive error message
 * @param {Error|string} [options.error] - Error object or message for details
 * @param {string} [options.actionLabel='Try Again'] - Action button label
 * @param {Function} [options.onAction] - Action button click handler
 * @param {boolean} [options.showDetails=false] - Show error details
 * @param {string} [options.className] - Additional CSS classes
 * @returns {HTMLElement} ErrorState component
 *
 * @example
 * const error = ErrorState({
 *   title: 'Failed to load data',
 *   message: 'Check your connection and try again.',
 *   error: new Error('Network timeout'),
 *   actionLabel: 'Retry',
 *   showDetails: true,
 *   onAction: () => location.reload()
 * });
 */
export function ErrorState({
    icon = 'exclamation-triangle',
    title = 'Something went wrong',
    message = 'Try again. If the problem continues, reload the page.',
    error = null,
    actionLabel = 'Try Again',
    onAction,
    showDetails = false,
    className = ''
} = {}) {
    let detailsVisible = false;

    /**
     * Get error message
     */
    const getErrorMessage = () => {
        if (!error) return '';
        if (typeof error === 'string') return error;
        if (error instanceof Error) return error.message;
        return JSON.stringify(error, null, 2);
    };

    /**
     * Template function
     */
    const template = () => {
        // Resolve classes from active theme
        const containerClass = cn(
            resolveClasses('errorstate'),
            'error-state',
            className
        );
        const iconClass = cn(
            'bi',
            `bi-${escapeAttribute(icon)}`,
            resolvePartClasses('errorstate', 'icon')
        );
        const titleClass = cn(
            resolvePartClasses('errorstate', 'title'),
            'error-state-title'
        );
        const messageClass = cn(
            resolvePartClasses('errorstate', 'message'),
            'error-state-message'
        );
        const buttonClass = cn(
            resolvePartClasses('errorstate', 'action') || resolveClasses('button', { variant: 'primary' }),
            'error-state-action'
        );
        const toggleClass = cn(
            resolveClasses('button', { variant: 'text', size: 'sm' }),
            'error-details-toggle'
        );
        const detailsClass = cn(
            resolvePartClasses('errorboundary', 'stack'),
            'error-state-details'
        );

        const errorMsg = getErrorMessage();

        return `
            <div class="${containerClass}" role="alert" data-ref="container">
                <div class="error-state-icon" aria-hidden="true">
                    <i class="${iconClass}" style="font-size: 3rem;"></i>
                </div>
                <h4 class="${titleClass}">${escapeHtml(title)}</h4>
                ${message ? `
                    <p class="${messageClass}">${escapeHtml(message)}</p>
                ` : ''}

                ${showDetails && errorMsg ? `
                    <div class="error-state-details-wrapper">
                        <button type="button" class="${toggleClass}" data-ref="toggleBtn" aria-expanded="${detailsVisible}">
                            ${detailsVisible ? 'Hide' : 'Show'} Details
                        </button>
                        ${detailsVisible ? `
                            <pre class="${detailsClass}"
                                 style="max-width: 600px; margin: 1rem auto; text-align: left; max-height: 300px; overflow-y: auto;">
                                <code>${escapeHtml(errorMsg)}</code>
                            </pre>
                        ` : ''}
                    </div>
                ` : ''}

                ${actionLabel ? `
                    <button type="button" class="${buttonClass}" data-ref="actionBtn">
                        ${escapeHtml(actionLabel)}
                    </button>
                ` : ''}
            </div>
        `;
    };

    // Create component
    const component = createComponent(template, {
        icon,
        title,
        message,
        error,
        actionLabel,
        detailsVisible
    });

    /**
     * Setup event listeners
     */
    component.useEffect((el) => {
        // MEMORY LEAK FIX: Store handler references for proper cleanup
        const toggleBtn = el.refs.toggleBtn;
        let toggleHandler = null;

        // Details toggle
        if (toggleBtn) {
            toggleHandler = () => {
                detailsVisible = !detailsVisible;
                component.setState({ detailsVisible });
            };
            toggleBtn.addEventListener('click', toggleHandler);
        }

        // Action button
        if (onAction && el.refs.actionBtn) {
            el.refs.actionBtn.addEventListener('click', onAction);
        }

        // MEMORY LEAK FIX: Proper cleanup with stored handler references
        return () => {
            if (onAction && el.refs.actionBtn) {
                el.refs.actionBtn.removeEventListener('click', onAction);
            }
            if (toggleBtn && toggleHandler) {
                toggleBtn.removeEventListener('click', toggleHandler);
            }
        };
    });

    return component;
}
