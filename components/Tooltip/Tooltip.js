import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import themeProvider, { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

let tooltipIdCounter = 0;

/**
 * Tooltip Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Provides contextual information on hover/focus.
 *
 * Two usage modes:
 * 1. Imperative: attach to an existing element
 *    const tooltip = Tooltip({ element: btn, content: 'Hello', position: 'top' });
 *    tooltip.show(); tooltip.hide(); tooltip.destroy();
 * 2. Declarative: wrap children in a tooltip trigger
 *    Tooltip({ title: 'Hello', placement: 'top', children })
 *
 * @param {Object} props - Component properties
 * @param {HTMLElement} [props.element] - Target element to attach tooltip to (imperative mode)
 * @param {string} [props.content=''] - Tooltip content (imperative mode)
 * @param {string} [props.position='top'] - Tooltip position (top, bottom, left, right)
 * @param {number} [props.delay=0] - Show delay in milliseconds
 * @param {boolean} [props.arrow=true] - Display tooltip arrow
 * @param {string} [props.title=''] - Tooltip content (declarative mode)
 * @param {string} [props.placement='top'] - Tooltip position (declarative mode)
 * @param {*} [props.children=''] - Element to attach tooltip to (declarative mode)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {Object|HTMLElement} Tooltip API (imperative) or wrapper element (declarative)
 */
export function Tooltip({
    element = null,
    content = '',
    position = 'top',
    delay = 0,
    arrow = true,
    title = '',
    placement = 'top',
    children = '',
    className = ''
} = {}) {
    if (element) {
        return createImperativeTooltip({ element, content, position, delay, arrow, className });
    }

    // Declarative mode: wrap children in a tooltip trigger
    const popupPart = resolvePartClasses('tooltip', 'popup');

    if (popupPart) {
        // Themes with a popup part (Tailwind) need no Bootstrap JS: CSS shows it on hover and focus
        const theme = themeProvider.getTheme();
        const states = (theme && theme.components.tooltip && theme.components.tooltip.states) || {};
        const triggerClass = cn(resolvePartClasses('tooltip', 'trigger'), className);
        const popupClass = cn(popupPart, states[placement] || states.top || '');
        const popupId = `rnx-tooltip-${++tooltipIdCounter}`;
        const popupTemplate = () => `
            <span class="${triggerClass}" data-slot><span role="tooltip" id="${popupId}" class="${popupClass}">${escapeHtml(title)}</span></span>
        `;
        const popupComponent = createComponent(popupTemplate, { title, placement, children, className });
        popupComponent.useEffect((el) => {
            const popup = el.querySelector('[role="tooltip"]');
            const target = Array.from(el.children).find(c => c !== popup);
            if (target) target.setAttribute('aria-describedby', popupId);

            // Escape hides the popup until the pointer or focus comes back
            const dismiss = (e) => {
                if (e.key === 'Escape' && popup) popup.style.visibility = 'hidden';
            };
            const reveal = () => {
                if (popup) popup.style.visibility = '';
            };
            document.addEventListener('keydown', dismiss);
            el.addEventListener('mouseenter', reveal);
            el.addEventListener('focusin', reveal);
            return () => {
                document.removeEventListener('keydown', dismiss);
                el.removeEventListener('mouseenter', reveal);
                el.removeEventListener('focusin', reveal);
            };
        });
        return popupComponent;
    }

    const tooltipClass = cn(resolveClasses('tooltip'), className);

    const template = () => `
        <span class="${tooltipClass}" data-bs-toggle="tooltip" data-bs-placement="${escapeHtml(placement)}" title="${escapeHtml(title)}" data-slot></span>
    `;

    return createComponent(template, { title, placement, children, className });
}

/**
 * Create an imperative tooltip attached to an existing element
 */
function createImperativeTooltip({ element, content, position, delay, arrow, className }) {
    let showTimer = null;
    let destroyed = false;

    const tooltipEl = document.createElement('div');
    tooltipEl.className = cn(resolveClasses('tooltip'), 'tooltip', position, className);
    tooltipEl.setAttribute('role', 'tooltip');

    const innerEl = document.createElement('div');
    innerEl.className = 'tooltip-inner';
    innerEl.textContent = content;
    tooltipEl.appendChild(innerEl);

    if (arrow) {
        const arrowEl = document.createElement('div');
        arrowEl.className = 'tooltip-arrow';
        tooltipEl.appendChild(arrowEl);
    }

    tooltipEl.style.position = 'absolute';
    (element.parentNode || document.body).appendChild(tooltipEl);

    const updatePosition = () => {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();
        const scrollX = window.scrollX || 0;
        const scrollY = window.scrollY || 0;
        const gap = 8;

        let top = 0;
        let left = 0;

        switch (position) {
            case 'bottom':
                top = rect.bottom + gap;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - gap;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + gap;
                break;
            case 'top':
            default:
                top = rect.top - tooltipRect.height - gap;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
        }

        tooltipEl.style.top = `${top + scrollY}px`;
        tooltipEl.style.left = `${left + scrollX}px`;
    };

    const show = () => {
        if (destroyed) return;
        updatePosition();
        tooltipEl.classList.add('visible');
    };

    const hide = () => {
        if (showTimer) {
            clearTimeout(showTimer);
            showTimer = null;
        }
        tooltipEl.classList.remove('visible');
    };

    const setContent = (newContent) => {
        innerEl.textContent = newContent;
    };

    const onMouseEnter = () => {
        if (delay > 0) {
            showTimer = setTimeout(show, delay);
        } else {
            show();
        }
    };

    const onMouseLeave = () => {
        hide();
    };

    element.addEventListener('mouseenter', onMouseEnter);
    element.addEventListener('mouseleave', onMouseLeave);
    element.addEventListener('focus', onMouseEnter);
    element.addEventListener('blur', onMouseLeave);

    const destroy = () => {
        destroyed = true;
        hide();
        element.removeEventListener('mouseenter', onMouseEnter);
        element.removeEventListener('mouseleave', onMouseLeave);
        element.removeEventListener('focus', onMouseEnter);
        element.removeEventListener('blur', onMouseLeave);
        if (tooltipEl.parentNode) {
            tooltipEl.parentNode.removeChild(tooltipEl);
        }
    };

    return {
        el: tooltipEl,
        show,
        hide,
        setContent,
        destroy
    };
}
