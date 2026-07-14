import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Chips Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Material Design 3 chip components for filtering and selection.
 *
 * @param {Object} props - Component properties
 * @param {Array|string} [props.items=[]] - Chip items [{label, icon, selected, value}]
 * @param {string} [props.type='filter'] - Chip type (filter, input, suggestion, assist)
 * @param {Function} [props.onselect] - Called when chip is selected
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Chips element
 */
export function Chips({ items = [], type = 'filter', onselect, className = '' }) {
    // Parse items if passed as string
    let parsedItems = items;
    if (typeof items === 'string') {
        try {
            parsedItems = JSON.parse(items.replace(/'/g, '"').replace(/([a-zA-Z0-9]+):/g, '"$1":'));
        } catch (e) {
            console.warn('[rnxJS] Chips: invalid items format', items);
            parsedItems = [];
        }
    }

    // Resolve classes from active theme
    const containerClass = cn(
        resolveClasses('chips'),
        'd-flex flex-wrap gap-2 flex flex-wrap gap-2',
        className
    );
    const chipClass = resolvePartClasses('chips', 'chip') || 'm3-chip';
    const selectedClass = resolvePartClasses('chips', 'selected') || 'selected';

    const template = ({ items, type }) => `
    <div class="${containerClass}">
      ${parsedItems.map((item, idx) => `
       <span class="${cn(chipClass, item.selected ? selectedClass : '')}"
             data-index="${idx}"
             data-ref="chip-${idx}">
         ${item.selected && type === 'filter' ? '<i class="bi bi-check"></i>' : (item.icon ? `<i class="bi bi-${escapeHtml(item.icon)}"></i>` : '')}
         ${escapeHtml(item.label || '')}
       </span>
      `).join('')}
    </div>
  `;

    const component = createComponent(template, { items, type, className });

    component.useEffect(() => {
        // MEMORY LEAK FIX: Store handlers for cleanup
        const handlers = [];

        parsedItems.forEach((item, idx) => {
            const el = component.refs[`chip-${idx}`];
            if (el) {
                const handler = () => {
                    if (onselect) onselect(item, idx);
                };
                el.addEventListener('click', handler);
                handlers.push({ element: el, handler });
            }
        });

        // Cleanup
        return () => {
            handlers.forEach(({ element, handler }) => {
                element.removeEventListener('click', handler);
            });
        };
    });

    return component;
}
