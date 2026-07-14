/**
 * StatCard Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Dashboard statistic card with value, trend, and icon.
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses, resolveUtility } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Create a statistic card for dashboard displays
 *
 * @param {Object} options - Configuration options
 * @param {string} options.label - Label text above the value
 * @param {string|number} options.value - The main statistic value
 * @param {string} options.icon - Bootstrap icon name (e.g., 'people', 'currency-dollar')
 * @param {Object} options.change - Trend information {value: number, trend: 'up'|'down'|'neutral'}
 * @param {string} options.variant - Color variant: 'primary', 'success', 'danger', 'warning', 'info', 'light' (default: 'primary')
 * @param {string} options.footer - Optional footer text
 * @param {Function} options.onclick - Click handler callback
 * @param {string} options.className - Additional CSS classes
 * @returns {HTMLElement} StatCard component
 *
 * @example
 * const card = StatCard({
 *   label: 'Total Users',
 *   value: 2543,
 *   icon: 'people',
 *   change: { value: 12.5, trend: 'up' },
 *   variant: 'primary'
 * });
 */
export function StatCard({
    label = '',
    value = '—',
    icon = '',
    change = null,
    variant = 'primary',
    footer = '',
    onclick,
    className = ''
} = {}) {
    // Validate variant
    const validVariants = ['primary', 'success', 'danger', 'warning', 'info', 'light'];
    if (!validVariants.includes(variant)) {
        console.warn(`StatCard: Invalid variant "${variant}", using "primary"`);
    }

    /**
     * Template function
     */
    const template = ({ label, value, icon, change, variant, footer }) => {
        // Resolve classes from active theme
        const cardClass = cn(
            resolveClasses('statcard', { variant }),
            'stat-card',
            onclick ? 'cursor-pointer' : '',
            className
        );

        const bodyClass = resolvePartClasses('statcard', 'body');
        const titleClass = resolvePartClasses('statcard', 'title');
        const valueClass = resolvePartClasses('statcard', 'value');
        const trendClass = resolvePartClasses('statcard', 'trend');

        const layoutClass = cn(
            resolveUtility('layout', 'flex'),
            resolveUtility('flexbox', 'justifyBetween'),
            resolveUtility('flexbox', 'alignStart')
        );

        const trendColor = change
            ? resolveUtility(
                'text',
                change.trend === 'up' ? 'success' : change.trend === 'down' ? 'danger' : 'muted'
              )
            : '';

        const trendIcon = change
            ? change.trend === 'up'
                ? 'arrow-up'
                : change.trend === 'down'
                ? 'arrow-down'
                : 'dash'
            : '';

        return `
            <div class="${cardClass}" data-ref="card"${onclick ? ' role="button" tabindex="0"' : ''}>
                <div class="${bodyClass}">
                    <div class="${layoutClass}">
                        <div style="flex: 1 1 auto;">
                            <p class="${titleClass}">
                                ${escapeHtml(label)}
                            </p>
                            <h3 class="${valueClass}" data-ref="value">
                                ${escapeHtml(String(value))}
                            </h3>
                            ${change ? `
                                <small class="${cn(trendClass, trendColor)}" style="display: inline-block;">
                                    <i class="bi bi-${trendIcon}" aria-hidden="true"></i>
                                    ${escapeHtml(String(Math.abs(change.value)))}%
                                </small>
                            ` : ''}
                        </div>
                        ${icon ? `
                            <div class="${cn('stat-icon', resolveUtility('spacing', 'ml', 3), resolveUtility('text', variant))}" data-ref="icon" aria-hidden="true">
                                <i class="bi bi-${escapeHtml(icon)}" style="font-size: 2rem; opacity: 0.7;"></i>
                            </div>
                        ` : ''}
                    </div>
                    ${footer ? `
                        <div class="${cn(resolveUtility('spacing', 'mt', 3), resolveUtility('spacing', 'pt', 3), resolveUtility('borders', 'borderTop'))}">
                            <small class="${resolveUtility('text', 'muted')}">${escapeHtml(footer)}</small>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    };

    // Create component
    const component = createComponent(template, {
        label,
        value,
        icon,
        change,
        variant,
        footer
    });

    /**
     * Setup event listeners
     */
    component.useEffect((el) => {
        if (onclick && el.refs.card) {
            const card = el.refs.card;
            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onclick(e);
                }
            };
            card.addEventListener('click', onclick);
            card.addEventListener('keydown', keyHandler);
            return () => {
                card.removeEventListener('click', onclick);
                card.removeEventListener('keydown', keyHandler);
            };
        }
    });

    /**
     * Export update methods
     */
    component.setValue = (newValue) => {
        const valueEl = component.querySelector('[data-ref="value"]');
        if (valueEl) {
            valueEl.textContent = String(newValue);
        }
    };

    component.setChange = (newChange) => {
        if (newChange) {
            component.setState({
                change: newChange
            });
        }
    };

    return component;
}
