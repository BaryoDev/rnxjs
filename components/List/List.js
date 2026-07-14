import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import themeProvider, { resolveClasses, resolvePartClasses, resolveUtility } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

const themeState = (component, state) => {
  const theme = themeProvider.getTheme();
  return (theme && theme.components[component] && theme.components[component].states &&
    theme.components[component].states[state]) || '';
};

/**
 * List Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Material Design 3 inspired list with leading/trailing elements.
 *
 * @param {Object} props - Component properties
 * @param {Array} [props.items=[]] - List items [{headline, supportingText, leadingIcon, trailingIcon, active, disabled, onclick}]
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
export function List({ items = [], className = '' } = {}) {
  if (!Array.isArray(items)) items = [];

  // Resolve classes from active theme
  const listClass = cn(resolveClasses('list'), 'list-group', className);
  const itemClass = resolvePartClasses('list', 'item') || 'list-item';
  const itemActionClass = resolvePartClasses('list', 'itemAction') || 'list-item-action';
  const activeClass = themeState('list', 'active');
  const disabledClass = themeState('list', 'disabled');
  const leadingClass = resolvePartClasses('list', 'leading') || 'list-item-leading';
  const contentClass = resolvePartClasses('list', 'content') || 'list-item-content';
  const headlineClass = resolvePartClasses('list', 'headline') || 'list-item-headline';
  const supportingClass = cn(resolvePartClasses('list', 'supporting'), resolveUtility('text', 'muted'));
  const trailingClass = resolvePartClasses('list', 'trailing') || 'list-item-trailing';

  const template = ({ items }) => `
    <ul class="${listClass}" style="list-style: none; margin: 0; padding: 0;">
      ${items.map((item, idx) => {
        const clickable = Boolean(item.onclick) && !item.disabled;
        return `
        <li class="${cn(itemClass, clickable ? itemActionClass : '', item.active ? activeClass : '', item.disabled ? disabledClass : '')}"
            data-index="${idx}"
            data-ref="item-${idx}"
            ${item.disabled ? 'aria-disabled="true"' : ''}
            ${clickable ? 'tabindex="0"' : ''}
            style="display: flex; align-items: center; gap: 0.75rem; cursor: ${clickable ? 'pointer' : 'default'};">

           ${item.leadingIcon ? `
             <span class="${leadingClass}" aria-hidden="true">
               <i class="bi bi-${escapeHtml(item.leadingIcon)}"></i>
             </span>
           ` : ''}

           <span class="${contentClass}" style="display: flex; flex-direction: column; flex: 1 1 auto;">
             <span class="${headlineClass}">${escapeHtml(item.headline || '')}</span>
             ${item.supportingText ? `<small class="${supportingClass}">${escapeHtml(item.supportingText)}</small>` : ''}
           </span>

           ${item.trailingIcon ? `
             <span class="${trailingClass}" aria-hidden="true">
               <i class="bi bi-${escapeHtml(item.trailingIcon)}"></i>
             </span>
           ` : ''}
        </li>
      `;
      }).join('')}
    </ul>
  `;

  const component = createComponent(template, { items, className });

  component.useEffect(() => {
    // MEMORY LEAK FIX: Store handlers for cleanup
    const handlers = [];

    items.forEach((item, idx) => {
      const el = component.refs[`item-${idx}`];
      if (el && item.onclick && !item.disabled) {
        const keydownHandler = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.onclick(e);
          }
        };
        el.addEventListener('click', item.onclick);
        el.addEventListener('keydown', keydownHandler);
        handlers.push({ element: el, handler: item.onclick, keydown: keydownHandler });
      }
    });

    // Cleanup
    return () => {
      handlers.forEach(({ element, handler, keydown }) => {
        element.removeEventListener('click', handler);
        element.removeEventListener('keydown', keydown);
      });
    };
  });

  return component;
}
