/**
 * StatCard Component for rnxJS
 * Dashboard statistic card with value, trend, and icon
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';

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
}) {
    // Validate variant
    const validVariants = ['primary', 'success', 'danger', 'warning', 'info', 'light'];
    if (!validVariants.includes(variant)) {
        console.warn(`StatCard: Invalid variant "${variant}", using "primary"`);
    }

    /**
     * Template function
     */
    const template = () => {
        const trendColor = change
            ? change.trend === 'up'
                ? 'text-success'
                : change.trend === 'down'
                ? 'text-danger'
                : 'text-muted'
            : '';

        const trendIcon = change
            ? change.trend === 'up'
                ? 'arrow-up'
                : change.trend === 'down'
                ? 'arrow-down'
                : 'dash'
            : '';

        return `
            <div class="card stat-card bg-${variant} ${onclick ? 'cursor-pointer' : ''} ${className}" data-ref="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <p class="card-text text-muted mb-2" style="font-size: 0.875rem;">
                                ${escapeHtml(label)}
                            </p>
                            <h3 class="card-title mb-0" data-ref="value">
                                ${escapeHtml(String(value))}
                            </h3>
                            ${change ? `
                                <small class="${trendColor} mt-2" style="display: inline-block;">
                                    <i class="bi bi-${trendIcon}"></i>
                                    ${Math.abs(change.value)}%
                                </small>
                            ` : ''}
                        </div>
                        ${icon ? `
                            <div class="stat-icon ms-3" data-ref="icon">
                                <i class="bi bi-${icon} fs-2 text-${variant}" style="opacity: 0.7;"></i>
                            </div>
                        ` : ''}
                    </div>
                    ${footer ? `
                        <div class="mt-3 pt-3 border-top">
                            <small class="text-muted">${escapeHtml(footer)}</small>
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
            el.refs.card.addEventListener('click', onclick);
            return () => {
                el.refs.card.removeEventListener('click', onclick);
            };
        }
    });

    /**
     * Export update methods
     */
    component.setValue = (newValue) => {
        const valueEl = component.querySelector('[data-ref="value"]');
        if (valueEl) {
            valueEl.textContent = escapeHtml(String(newValue));
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
