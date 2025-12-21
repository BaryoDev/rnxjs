/**
 * EmptyState Component for rnxJS
 * Placeholder for empty data lists
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Create an empty state display
 *
 * @param {Object} options - Configuration options
 * @param {string} options.icon - Bootstrap icon name (default: 'inbox')
 * @param {string} options.title - Title text (default: 'No data available')
 * @param {string} options.message - Optional descriptive message
 * @param {string} options.actionLabel - Optional action button label
 * @param {Function} options.onAction - Action button click handler
 * @param {string} options.className - Additional CSS classes
 * @returns {HTMLElement} EmptyState component
 *
 * @example
 * const empty = EmptyState({
 *   icon: 'inbox',
 *   title: 'No items yet',
 *   message: 'Get started by creating your first item',
 *   actionLabel: 'Create Item',
 *   onAction: () => console.log('Creating item...')
 * });
 */
export function EmptyState({
    icon = 'inbox',
    title = 'No data available',
    message = '',
    actionLabel = '',
    onAction,
    className = ''
}) {
    /**
     * Template function
     */
    const template = () => {
        return `
            <div class="empty-state text-center py-5 ${className}" data-ref="container">
                <div class="mb-4">
                    <i class="bi bi-${icon} d-block" style="font-size: 3rem; color: #ccc;"></i>
                </div>
                <h4 class="text-muted mb-2">${escapeHtml(title)}</h4>
                ${message ? `
                    <p class="text-muted mb-4">${escapeHtml(message)}</p>
                ` : ''}
                ${actionLabel ? `
                    <button class="btn btn-primary empty-state-action" data-ref="actionBtn">
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
        actionLabel
    });

    /**
     * Setup event listeners
     */
    component.useEffect((el) => {
        if (onAction && el.refs.actionBtn) {
            el.refs.actionBtn.addEventListener('click', onAction);
            return () => {
                el.refs.actionBtn.removeEventListener('click', onAction);
            };
        }
    });

    return component;
}
