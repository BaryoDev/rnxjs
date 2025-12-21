/**
 * ErrorState Component for rnxJS
 * Error display with optional details and retry action
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Create an error state display
 *
 * @param {Object} options - Configuration options
 * @param {string} options.icon - Bootstrap icon name (default: 'exclamation-triangle')
 * @param {string} options.title - Title text (default: 'Something went wrong')
 * @param {string} options.message - Descriptive error message
 * @param {Error|string} options.error - Error object or message for details
 * @param {string} options.actionLabel - Action button label (default: 'Try Again')
 * @param {Function} options.onAction - Action button click handler
 * @param {boolean} options.showDetails - Show error details (default: false)
 * @param {string} options.className - Additional CSS classes
 * @returns {HTMLElement} ErrorState component
 *
 * @example
 * const error = ErrorState({
 *   title: 'Failed to load data',
 *   message: 'Please check your connection and try again',
 *   error: new Error('Network timeout'),
 *   actionLabel: 'Retry',
 *   showDetails: true,
 *   onAction: () => location.reload()
 * });
 */
export function ErrorState({
    icon = 'exclamation-triangle',
    title = 'Something went wrong',
    message = '',
    error = null,
    actionLabel = 'Try Again',
    onAction,
    showDetails = false,
    className = ''
}) {
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
        const errorMsg = getErrorMessage();

        return `
            <div class="error-state text-center py-5 ${className}" data-ref="container">
                <div class="mb-4">
                    <i class="bi bi-${icon} d-block text-danger" style="font-size: 3rem;"></i>
                </div>
                <h4 class="text-danger mb-2">${escapeHtml(title)}</h4>
                ${message ? `
                    <p class="text-muted mb-4">${escapeHtml(message)}</p>
                ` : ''}

                ${showDetails && errorMsg ? `
                    <div class="mb-4">
                        <button class="btn btn-link btn-sm error-details-toggle" data-ref="toggleBtn">
                            ${detailsVisible ? 'Hide' : 'Show'} Details
                        </button>
                        ${detailsVisible ? `
                            <pre class="text-start bg-light p-3 rounded mt-2"
                                 style="max-width: 600px; margin: 1rem auto; font-size: 0.85rem; max-height: 300px; overflow-y: auto;">
                                <code>${escapeHtml(errorMsg)}</code>
                            </pre>
                        ` : ''}
                    </div>
                ` : ''}

                ${actionLabel ? `
                    <button class="btn btn-primary error-state-action" data-ref="actionBtn">
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
        // Details toggle
        const toggleBtn = el.refs.toggleBtn;
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                detailsVisible = !detailsVisible;
                component.setState({ detailsVisible });
            });
        }

        // Action button
        if (onAction && el.refs.actionBtn) {
            el.refs.actionBtn.addEventListener('click', onAction);
            return () => {
                el.refs.actionBtn.removeEventListener('click', onAction);
                if (toggleBtn) {
                    toggleBtn.removeEventListener('click', null);
                }
            };
        }
    });

    return component;
}
