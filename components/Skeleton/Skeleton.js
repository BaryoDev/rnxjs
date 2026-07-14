/**
 * Skeleton Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Loading placeholder with animated shimmer effect.
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeAttribute } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

const SR_ONLY_STYLE = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';

/**
 * Create a skeleton/placeholder for loading states
 *
 * @param {Object} [options] - Configuration options
 * @param {string} [options.variant='text'] - Type of skeleton: 'text', 'circle', 'rectangle', 'card', 'table'
 * @param {string} [options.width='100%'] - Width (CSS value, e.g., '100%', '200px')
 * @param {string} [options.height='20px'] - Height (CSS value)
 * @param {number} [options.lines=3] - Number of lines for text variant
 * @param {number} [options.rows=5] - Number of rows for table variant
 * @param {number} [options.cols=4] - Number of columns for table variant
 * @param {string} [options.animation='wave'] - Animation type: 'wave', 'pulse', 'none'
 * @param {string} [options.className] - Additional CSS classes
 * @returns {HTMLElement} Skeleton component
 *
 * @example
 * // Text skeleton with 3 lines
 * const skeleton = Skeleton({ variant: 'text', lines: 3 });
 *
 * // Circle skeleton (avatar)
 * const avatarSkeleton = Skeleton({ variant: 'circle', width: '40px', height: '40px' });
 *
 * // Card skeleton
 * const cardSkeleton = Skeleton({ variant: 'card' });
 *
 * // Table skeleton
 * const tableSkeleton = Skeleton({ variant: 'table', rows: 5, cols: 4 });
 */
export function Skeleton({
    variant = 'text',
    width = '100%',
    height = '20px',
    lines = 3,
    rows = 5,
    cols = 4,
    animation = 'wave',
    className = ''
} = {}) {
    // Validate variant
    const validVariants = ['text', 'circle', 'rectangle', 'card', 'table'];
    if (!validVariants.includes(variant)) {
        console.warn(`Skeleton: Invalid variant "${variant}", using "text"`);
        variant = 'text';
    }

    const safeWidth = escapeAttribute(width);
    const safeHeight = escapeAttribute(height);

    /**
     * Template function
     */
    const template = () => {
        // Resolve classes from active theme
        const baseClass = resolveClasses('skeleton');
        const itemClass = resolvePartClasses('skeleton', 'item');
        const animClass = animation && animation !== 'none' ? `skeleton-${escapeAttribute(animation)}` : '';
        const srOnly = `<span style="${SR_ONLY_STYLE}">Loading…</span>`;
        const a11y = 'role="status" aria-busy="true"';

        switch (variant) {
            case 'circle':
                return `
                    <div class="${cn(baseClass, itemClass, 'skeleton skeleton-circle', animClass, className)}"
                         ${a11y}
                         style="width: ${safeWidth}; height: ${safeHeight}; border-radius: 50%;">${srOnly}</div>
                `;

            case 'rectangle':
                return `
                    <div class="${cn(baseClass, itemClass, 'skeleton skeleton-rectangle', animClass, className)}"
                         ${a11y}
                         style="width: ${safeWidth}; height: ${safeHeight};">${srOnly}</div>
                `;

            case 'card':
                return `
                    <div class="${cn(resolveClasses('card'), baseClass, 'skeleton-card', className)}" ${a11y}>
                        ${srOnly}
                        <div class="${cn(itemClass, 'skeleton skeleton-rectangle', animClass)}" aria-hidden="true"
                             style="height: 200px; width: 100%;"></div>
                        <div class="${cn(resolvePartClasses('card', 'body'), 'skeleton-card-body')}" aria-hidden="true">
                            <div class="${cn(itemClass, 'skeleton skeleton-text', animClass)}"
                                 style="width: 60%; height: 24px; margin-bottom: 1rem;"></div>
                            <div class="${cn(itemClass, 'skeleton skeleton-text', animClass)}"
                                 style="width: 100%; height: 16px; margin-bottom: 0.5rem;"></div>
                            <div class="${cn(itemClass, 'skeleton skeleton-text', animClass)}"
                                 style="width: 100%; height: 16px; margin-bottom: 0.5rem;"></div>
                            <div class="${cn(itemClass, 'skeleton skeleton-text', animClass)}"
                                 style="width: 40%; height: 16px;"></div>
                        </div>
                    </div>
                `;

            case 'table':
                return `
                    <div class="${cn(baseClass, 'skeleton-table', className)}" ${a11y}>
                        ${srOnly}
                        <div class="skeleton-row skeleton-header" aria-hidden="true">
                            ${Array(cols)
                                .fill(0)
                                .map(
                                    () =>
                                        `<div class="${cn(itemClass, 'skeleton skeleton-cell', animClass)}"
                                              style="height: 20px;"></div>`
                                )
                                .join('')}
                        </div>
                        ${Array(rows)
                            .fill(0)
                            .map(
                                () =>
                                    `<div class="skeleton-row" aria-hidden="true">
                                        ${Array(cols)
                                            .fill(0)
                                            .map(
                                                () =>
                                                    `<div class="${cn(itemClass, 'skeleton skeleton-cell', animClass)}"
                                                          style="height: 20px;"></div>`
                                            )
                                            .join('')}
                                    </div>`
                            )
                            .join('')}
                    </div>
                `;

            case 'text':
            default:
                return `
                    <div class="${cn(baseClass, 'skeleton-text', className)}" ${a11y}>
                        ${srOnly}
                        ${Array(lines)
                            .fill(0)
                            .map(
                                (_, i) =>
                                    `<div class="${cn(itemClass, 'skeleton skeleton-line', animClass)}" aria-hidden="true"
                                          style="width: ${i === lines - 1 ? '60%' : '100%'}; height: ${safeHeight}; margin-bottom: 0.5rem;"></div>`
                            )
                            .join('')}
                    </div>
                `;
        }
    };

    // Create component
    const component = createComponent(template, {
        variant,
        width,
        height,
        lines,
        rows,
        cols,
        animation
    });

    return component;
}
