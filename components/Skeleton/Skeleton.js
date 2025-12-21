/**
 * Skeleton Component for rnxJS
 * Loading placeholder with animated shimmer effect
 */

import { createComponent } from '../../utils/createComponent.js';

/**
 * Create a skeleton/placeholder for loading states
 *
 * @param {Object} options - Configuration options
 * @param {string} options.variant - Type of skeleton: 'text', 'circle', 'rectangle', 'card', 'table' (default: 'text')
 * @param {string} options.width - Width (CSS value, e.g., '100%', '200px')
 * @param {string} options.height - Height (CSS value)
 * @param {number} options.lines - Number of lines for text variant (default: 3)
 * @param {number} options.rows - Number of rows for table variant (default: 5)
 * @param {number} options.cols - Number of columns for table variant (default: 4)
 * @param {string} options.animation - Animation type: 'wave', 'pulse', 'none' (default: 'wave')
 * @param {string} options.className - Additional CSS classes
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
}) {
    // Validate variant
    const validVariants = ['text', 'circle', 'rectangle', 'card', 'table'];
    if (!validVariants.includes(variant)) {
        console.warn(`Skeleton: Invalid variant "${variant}", using "text"`);
    }

    /**
     * Template function
     */
    const template = () => {
        const animClass = `skeleton-${animation}`;

        switch (variant) {
            case 'circle':
                return `
                    <div class="skeleton skeleton-circle ${animClass} ${className}"
                         style="width: ${width}; height: ${height};"></div>
                `;

            case 'rectangle':
                return `
                    <div class="skeleton skeleton-rectangle ${animClass} ${className}"
                         style="width: ${width}; height: ${height};"></div>
                `;

            case 'card':
                return `
                    <div class="card skeleton-card ${className}">
                        <div class="skeleton skeleton-rectangle ${animClass}"
                             style="height: 200px; width: 100%;"></div>
                        <div class="card-body">
                            <div class="skeleton skeleton-text ${animClass} mb-3"
                                 style="width: 60%; height: 24px;"></div>
                            <div class="skeleton skeleton-text ${animClass} mb-2"
                                 style="width: 100%; height: 16px;"></div>
                            <div class="skeleton skeleton-text ${animClass} mb-2"
                                 style="width: 100%; height: 16px;"></div>
                            <div class="skeleton skeleton-text ${animClass}"
                                 style="width: 40%; height: 16px;"></div>
                        </div>
                    </div>
                `;

            case 'table':
                return `
                    <div class="skeleton-table ${className}">
                        <div class="skeleton-row skeleton-header">
                            ${Array(cols)
                                .fill(0)
                                .map(
                                    () =>
                                        `<div class="skeleton skeleton-cell ${animClass}"
                                              style="height: 20px;"></div>`
                                )
                                .join('')}
                        </div>
                        ${Array(rows)
                            .fill(0)
                            .map(
                                () =>
                                    `<div class="skeleton-row">
                                        ${Array(cols)
                                            .fill(0)
                                            .map(
                                                () =>
                                                    `<div class="skeleton skeleton-cell ${animClass}"
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
                    <div class="skeleton-text ${className}">
                        ${Array(lines)
                            .fill(0)
                            .map(
                                (_, i) =>
                                    `<div class="skeleton skeleton-line ${animClass}"
                                          style="width: ${i === lines - 1 ? '60%' : '100%'}; height: ${height}; margin-bottom: 0.5rem;"></div>`
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
