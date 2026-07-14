import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses, resolveUtility } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Chips Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Material Design 3 chip components for filtering and selection.
 *
 * @param {Object} [props={}] - Component properties
 * @param {Array|string} [props.items=[]] - Chip items [{label, icon, selected, value, variant}]
 * @param {string} [props.type='filter'] - Chip type (filter, input, suggestion, assist)
 * @param {Function} [props.onselect] - Called when chip is selected
 * @param {Function} [props.onremove] - Called when a chip's remove button is clicked; adds remove buttons
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Chips element
 */
export function Chips({ items = [], type = 'filter', onselect, onremove, className = '' } = {}) {
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
    if (!Array.isArray(parsedItems)) {
        parsedItems = [];
    }

    const isInteractive = typeof onselect === 'function';
    const isRemovable = typeof onremove === 'function';

    // Resolve classes from active theme
    const containerClass = cn(
        resolveUtility('layout', 'flex'),
        resolveUtility('flexbox', 'wrap'),
        'gap-2',
        className
    );
    const chipClass = resolvePartClasses('chips', 'chip') || 'm3-chip';
    const selectedClass = resolvePartClasses('chips', 'selected') || 'selected';
    const removeClass = resolvePartClasses('chips', 'remove') || 'btn-close';

    const chipAttrs = (item, idx) => {
        const attrs = [`data-index="${idx}"`, `data-ref="chip-${idx}"`];
        if (isInteractive) {
            attrs.push('role="button"', 'tabindex="0"');
            if (type === 'filter') {
                attrs.push(`aria-pressed="${item.selected ? 'true' : 'false'}"`);
            }
        }
        return attrs.join(' ');
    };

    const template = ({ items, type }) => `
    <div class="${escapeHtml(containerClass)}" role="${isInteractive ? 'group' : 'presentation'}">
      ${parsedItems.map((item, idx) => `
       <span class="${escapeHtml(cn(
           resolveClasses('chips', { variant: item.variant || 'primary', removable: isRemovable }),
           chipClass,
           item.selected ? selectedClass : ''
       ))}"
             ${chipAttrs(item, idx)}>
         ${item.selected && type === 'filter' ? '<i class="bi bi-check" aria-hidden="true"></i>' : (item.icon ? `<i class="bi bi-${escapeHtml(item.icon)}" aria-hidden="true"></i>` : '')}
         ${escapeHtml(item.label || '')}
         ${isRemovable ? `<button type="button" class="${escapeHtml(removeClass)}" data-ref="remove-${idx}" aria-label="Remove ${escapeHtml(item.label || '')}" data-rnx-ignore="true"></button>` : ''}
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
            if (el && isInteractive) {
                const handler = (event) => {
                    if (event.target.closest('button')) return;
                    onselect(item, idx);
                };
                const keyHandler = (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onselect(item, idx);
                    }
                };
                el.addEventListener('click', handler);
                el.addEventListener('keydown', keyHandler);
                handlers.push({ element: el, event: 'click', handler });
                handlers.push({ element: el, event: 'keydown', handler: keyHandler });
            }

            const removeBtn = component.refs[`remove-${idx}`];
            if (removeBtn && isRemovable) {
                const removeHandler = () => onremove(item, idx);
                removeBtn.addEventListener('click', removeHandler);
                handlers.push({ element: removeBtn, event: 'click', handler: removeHandler });
            }
        });

        // Cleanup
        return () => {
            handlers.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
        };
    });

    return component;
}
