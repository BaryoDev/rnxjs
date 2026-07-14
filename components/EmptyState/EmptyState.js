/**
 * EmptyState Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Placeholder for empty data lists.
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml, escapeAttribute } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Create an empty state display
 *
 * @param {Object} [options] - Configuration options
 * @param {string} [options.icon='inbox'] - Bootstrap icon name
 * @param {string} [options.title='Nothing here yet'] - Title text
 * @param {string} [options.message] - Optional descriptive message
 * @param {string} [options.actionLabel] - Optional action button label
 * @param {Function} [options.onAction] - Action button click handler
 * @param {string} [options.className] - Additional CSS classes
 * @returns {HTMLElement} EmptyState component
 *
 * @example
 * const empty = EmptyState({
 *   icon: 'inbox',
 *   title: 'No items yet',
 *   message: 'Create your first item to get started.',
 *   actionLabel: 'Create Item',
 *   onAction: () => console.log('Creating item...')
 * });
 */
export function EmptyState({
    icon = 'inbox',
    title = 'Nothing here yet',
    message = '',
    actionLabel = '',
    onAction,
    className = ''
} = {}) {
    /**
     * Template function
     */
    const template = () => {
        // Resolve classes from active theme
        const containerClass = cn(
            resolveClasses('emptystate'),
            'empty-state',
            className
        );
        const iconClass = cn(
            resolvePartClasses('emptystate', 'icon'),
            'empty-state-icon'
        );
        const titleClass = cn(
            resolvePartClasses('emptystate', 'title'),
            'empty-state-title'
        );
        const descriptionClass = cn(
            resolvePartClasses('emptystate', 'description'),
            'empty-state-description'
        );
        const buttonClass = cn(
            resolvePartClasses('emptystate', 'action') || resolveClasses('button', { variant: 'primary' }),
            'empty-state-action'
        );

        return `
            <div class="${containerClass}" data-ref="container">
                ${icon ? `
                    <div class="${iconClass}" aria-hidden="true">
                        <i class="bi bi-${escapeAttribute(icon)}" style="font-size: 3rem;"></i>
                    </div>
                ` : ''}
                <h4 class="${titleClass}">${escapeHtml(title)}</h4>
                ${message ? `
                    <p class="${descriptionClass}">${escapeHtml(message)}</p>
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
