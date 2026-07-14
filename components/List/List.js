import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * List Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Material Design 3 inspired list with leading/trailing elements.
 *
 * @param {Object} props - Component properties
 * @param {Array} [props.items=[]] - List items [{headline, supportingText, leadingIcon, trailingIcon, onclick}]
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} List element
 *
 * @example
 * <List
 *   items={[
 *     { headline: 'Item 1', supportingText: 'Description', leadingIcon: 'folder' },
 *     { headline: 'Item 2', trailingIcon: 'chevron-right', onclick: () => {} }
 *   ]}
 * />
 */
export function List({ items = [], className = '' }) {
  // Resolve classes from active theme
  const listClass = cn(
    resolveClasses('list'),
    'list-group list-group-flush',
    className
  );
  const itemClass = resolvePartClasses('list', 'item') || 'list-group-item d-flex align-items-center border-0 px-3 py-2';
  const itemActionClass = resolvePartClasses('list', 'itemAction') || 'list-group-item-action';
  const leadingClass = resolvePartClasses('list', 'leading') || 'me-3 mr-3 text-secondary';
  const contentClass = resolvePartClasses('list', 'content') || 'd-flex flex-column flex-grow-1 flex flex-col grow';
  const headlineClass = resolvePartClasses('list', 'headline') || 'fw-normal font-normal text-body';
  const supportingClass = resolvePartClasses('list', 'supporting') || 'text-muted text-sm';
  const trailingClass = resolvePartClasses('list', 'trailing') || 'ms-3 ml-3 text-secondary';

  const template = ({ items }) => `
    <ul class="${listClass}">
      ${items.map((item, idx) => `
        <li class="${cn(itemClass, item.onclick ? itemActionClass : '')}"
            data-index="${idx}"
            data-ref="item-${idx}"
            style="cursor: ${item.onclick ? 'pointer' : 'default'}; background-color: var(--md-sys-color-surface);">

           ${item.leadingIcon ? `
             <div class="${leadingClass}">
               <i class="bi bi-${escapeHtml(item.leadingIcon)}"></i>
             </div>
           ` : ''}

           <div class="${contentClass}">
             <span class="${headlineClass}">${escapeHtml(item.headline || '')}</span>
             ${item.supportingText ? `<small class="${supportingClass}">${escapeHtml(item.supportingText)}</small>` : ''}
           </div>

           ${item.trailingIcon ? `
             <div class="${trailingClass}">
               <i class="bi bi-${escapeHtml(item.trailingIcon)}"></i>
             </div>
           ` : ''}
        </li>
      `).join('')}
    </ul>
  `;

  const component = createComponent(template, { items, className });

  component.useEffect(() => {
    // MEMORY LEAK FIX: Store handlers for cleanup
    const handlers = [];

    items.forEach((item, idx) => {
      const el = component.refs[`item-${idx}`];
      if (el && item.onclick) {
        el.addEventListener('click', item.onclick);
        handlers.push({ element: el, handler: item.onclick });
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
