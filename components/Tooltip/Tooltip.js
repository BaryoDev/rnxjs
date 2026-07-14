import { createComponent } from '../../utils/createComponent.js';
import { bs } from '../../utils/bootstrap.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Tooltip Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Provides contextual information on hover/focus.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.title=''] - Tooltip content
 * @param {string} [props.placement='top'] - Tooltip position (top, bottom, left, right)
 * @param {*} [props.children=''] - Element to attach tooltip to
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Tooltip wrapper element
 */
export function Tooltip({ title = '', placement = 'top', children = '', className = '' }) {
    // Resolve classes from active theme
    const tooltipClass = cn(resolveClasses('tooltip'), className);

    // Tooltip wrapper needs to be an inline element usually, accessing the child directly is hard without VDOM
    // so we wrap in a span
    const template = () => `
        <span class="${tooltipClass}" data-bs-toggle="tooltip" data-bs-placement="${escapeHtml(placement)}" title="${escapeHtml(title)}" data-slot></span>
    `;

    const component = createComponent(template, { title, placement, children, className });

    component.useEffect((el) => {
        if (!bs.isAvailable() || !bs.Tooltip) return;

        const instance = new bs.Tooltip(el);

        return () => instance.dispose();
    });

    return component;
}
