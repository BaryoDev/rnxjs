/**
 * ProgressBar Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports determinate and indeterminate progress indicators.
 */

import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Create a progress bar component
 *
 * @param {Object} options - Configuration options
 * @param {number} options.value - Current value (0-100) for determinate
 * @param {string} options.variant - Color variant: primary, success, danger, warning, info (default: primary)
 * @param {boolean} options.striped - Add striped animation (default: false)
 * @param {boolean} options.animated - Animate striped pattern (default: true)
 * @param {boolean} options.indeterminate - Show indeterminate progress (default: false)
 * @param {string} options.label - Optional label text
 * @param {boolean} options.showValue - Show percentage value (default: true)
 * @param {string} options.height - Height in CSS units (default: '1.5rem')
 * @param {string} options.className - Additional CSS classes for Blazor-style customization
 * @returns {HTMLElement} ProgressBar component
 *
 * @example
 * // Basic usage
 * <ProgressBar value={65} />
 *
 * @example
 * // With label and variant
 * <ProgressBar value={80} variant="success" label="Upload Progress" />
 *
 * @example
 * // Indeterminate (loading)
 * <ProgressBar indeterminate={true} />
 */
export function ProgressBar({
    value = 0,
    variant = 'primary',
    striped = false,
    animated = true,
    indeterminate = false,
    label = '',
    showValue = true,
    showLabel = false,
    height = '1.5rem',
    className = ''
} = {}) {
    // Clamp value between 0 and 100
    let currentValue = Math.max(0, Math.min(value, 100));

    // Resolve classes from active theme
    const progressClass = cn(
        resolveClasses('progressbar', {
          variant: striped ? 'striped' : (animated && striped ? 'animated' : undefined)
        }),
        'progress-bar-wrapper',
        className
    );

    const barClass = cn(
        resolvePartClasses('progressbar', 'bar'),
        'progress-bar',
        `progress-bar-${variant}`,
        `bg-${variant}`, // Color utility
        striped ? 'striped progress-bar-striped bg-gradient-to-r' : '',
        animated && striped ? 'animated progress-bar-animated animate-pulse' : '',
        indeterminate ? 'indeterminate progress-indeterminate' : ''
    );

    /**
     * Template function
     */
    const template = () => {
        return `
            <div class="progress-wrapper ${className}" data-ref="wrapper">
                ${label ? `
                    <div class="progress-label mb-2 flex justify-between">
                        <span class="label-text">${escapeHtml(label)}</span>
                        ${showValue && !indeterminate ? `
                            <span class="label-value">${currentValue}%</span>
                        ` : ''}
                    </div>
                ` : ''}

                <div class="${progressClass}" style="height: ${escapeHtml(height)};">
                    <div class="${barClass}"
                         role="progressbar"
                         aria-valuenow="${currentValue}"
                         aria-valuemin="0"
                         aria-valuemax="100"
                         ${!indeterminate ? `style="width: ${currentValue}%"` : ''}
                    >
                        ${(showValue || showLabel) && !striped && !indeterminate ? `
                            <span class="progress-text">${currentValue}%</span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    // Create component
    const component = createComponent(template, {
        currentValue,
        variant,
        indeterminate
    });

    // Export methods
    component.setValue = (newValue) => {
        currentValue = Math.max(0, Math.min(newValue, 100));
        component.setState({ currentValue });
    };

    component.getValue = () => currentValue;

    return component;
}
