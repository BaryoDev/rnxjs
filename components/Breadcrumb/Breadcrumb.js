/**
 * Breadcrumb Component for rnxJS
 * Navigation path display with customizable separator
 */

import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Create a breadcrumb navigation component
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.items - Breadcrumb items [{label, href, active}]
 * @param {string} options.separator - Separator between items (default: '/')
 * @param {string} options.className - Additional CSS classes
 * @returns {HTMLElement} Breadcrumb component
 *
 * @example
 * const breadcrumb = Breadcrumb({
 *   items: [
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Electronics', href: '/products/electronics', active: true }
 *   ],
 *   separator: '>'
 * });
 */
export function Breadcrumb({
    items = [],
    separator = '/',
    className = ''
}) {
    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Breadcrumb: items must be a non-empty array');
    }

    /**
     * Template function
     */
    const template = () => {
        return `
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0 ${className}">
                    ${items.map((item, index) => `
                        <li class="breadcrumb-item ${item.active ? 'active' : ''}">
                            ${item.active
                                ? `<span>${escapeHtml(item.label)}</span>`
                                : `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`
                            }
                        </li>
                    `).join(`<li class="breadcrumb-separator mx-1">${escapeHtml(separator)}</li>`)}
                </ol>
            </nav>
        `;
    };

    // Create component
    const component = createComponent(template);

    return component;
}
