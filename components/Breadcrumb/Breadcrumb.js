/**
 * Breadcrumb Component for rnxJS - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Navigation path display with customizable separator.
 */

import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml, sanitizeUrl } from '../../utils/security.js';

/**
 * Create a breadcrumb navigation component
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.items - Breadcrumb items [{label, href, active}]
 * @param {string} options.separator - Separator between items (default: '/')
 * @param {string} options.className - Additional CSS classes for Blazor-style customization
 * @returns {HTMLElement} Breadcrumb component
 *
 * @example
 * // Basic usage
 * <Breadcrumb items={[
 *   { label: 'Home', href: '/' },
 *   { label: 'Products', href: '/products' },
 *   { label: 'Electronics', active: true }
 * ]} />
 *
 * @example
 * // Custom separator
 * <Breadcrumb items={items} separator=">" />
 */
export function Breadcrumb({
    items = [],
    separator = '/',
    className = ''
} = {}) {
    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Breadcrumb: items must be a non-empty array');
    }

    // Resolve classes from active theme
    const breadcrumbClass = cn(
        resolveClasses('breadcrumb'),
        'breadcrumb',
        className
    );

    const itemClass = cn(resolvePartClasses('breadcrumb', 'item'), 'breadcrumb-item');
    const activeClass = cn(resolvePartClasses('breadcrumb', 'active'), 'breadcrumb-item active');
    const separatorClass = cn(resolvePartClasses('breadcrumb', 'separator'), 'breadcrumb-separator');

    /**
     * Template function
     */
    const template = () => {
        return `
            <nav aria-label="breadcrumb">
                <ol class="${breadcrumbClass}">
                    ${items.map((item) => `
                        <li class="${item.active ? activeClass : itemClass}"${item.active ? ' aria-current="page"' : ''}>
                            ${item.active
                                ? `<span>${escapeHtml(item.label)}</span>`
                                : `<a href="${escapeHtml(sanitizeUrl(item.href) || '#')}">${escapeHtml(item.label)}</a>`
                            }
                        </li>
                    `).join(`<li class="${separatorClass}" aria-hidden="true">${escapeHtml(separator)}</li>`)}
                </ol>
            </nav>
        `;
    };

    // Create component
    const component = createComponent(template, { items, separator, className });

    return component;
}
