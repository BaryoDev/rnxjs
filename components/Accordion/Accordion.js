import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml, sanitizeHtml } from '../../utils/security.js';
import themeProvider, { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

let accordionIdCounter = 0;

const themeState = (component, state) => {
  const theme = themeProvider.getTheme();
  return (theme && theme.components[component] && theme.components[component].states &&
    theme.components[component].states[state]) || '';
};

/**
 * Accordion Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Collapsible accordion. Accepts either declarative `items` or slotted children.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.id] - Accordion ID for collapse targeting (auto-generated if omitted)
 * @param {Array|string} [props.items=[]] - Items [{title, content, open}] (content is sanitized)
 * @param {boolean} [props.multiple=false] - Allow multiple panels open at once
 * @param {Function} [props.onToggle] - Called with ({index, open}) when a panel toggles
 * @param {*} [props.children=''] - Accordion items content (used when items is empty)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Accordion element
 */
export function Accordion({ id = 'accordion', items = [], multiple = false, onToggle, children = '', className = '' } = {}) {
  const accordionId = id || `rnx-accordion-${++accordionIdCounter}`;

  // Parse items if passed as string (attribute usage)
  let parsedItems = items;
  if (typeof items === 'string') {
    try {
      parsedItems = JSON.parse(items);
    } catch {
      parsedItems = [];
    }
  }
  if (!Array.isArray(parsedItems)) parsedItems = [];

  // Resolve classes from active theme
  const accordionClass = cn(resolveClasses('accordion'), 'accordion', className);
  const itemClass = cn(resolvePartClasses('accordion', 'item'), 'accordion-item');
  const headerClass = cn(resolvePartClasses('accordion', 'header'), 'accordion-header');
  const buttonClass = resolvePartClasses('accordion', 'button') || 'accordion-button';
  const collapseTokens = resolvePartClasses('accordion', 'collapse').split(' ').filter(Boolean);
  const bodyClass = resolvePartClasses('accordion', 'body') || 'accordion-body';
  const showTokens = themeState('accordion', 'show').split(' ').filter(Boolean);
  const hideTokens = themeState('accordion', 'hide').split(' ').filter(Boolean);
  const collapsedTokens = themeState('accordion', 'collapsed').split(' ').filter(Boolean);

  const renderItems = () => parsedItems.map((item, i) => {
    const open = item.open === true || item.open === 'true';
    const headingId = `${accordionId}-heading-${i}`;
    const panelId = `${accordionId}-collapse-${i}`;
    return `
      <div class="${itemClass}">
        <h3 class="${headerClass}" style="margin: 0;">
          <button type="button"
                  class="${cn(buttonClass, open ? '' : collapsedTokens.join(' '))}"
                  id="${escapeHtml(headingId)}"
                  data-accordion-index="${i}"
                  aria-expanded="${open ? 'true' : 'false'}"
                  aria-controls="${escapeHtml(panelId)}">${escapeHtml(item.title || `Item ${i + 1}`)}</button>
        </h3>
        <div id="${escapeHtml(panelId)}"
             class="${cn(collapseTokens.join(' '), (open ? showTokens : hideTokens).join(' '))}"
             role="region"
             aria-labelledby="${escapeHtml(headingId)}"
             ${open ? '' : 'hidden'}>
          <div class="${bodyClass}">${sanitizeHtml(item.content || '')}</div>
        </div>
      </div>
    `;
  }).join('');

  const template = () => `
    <div class="${accordionClass}" id="${escapeHtml(accordionId)}" ${parsedItems.length ? '' : 'data-slot'}>${parsedItems.length ? renderItems() : ''}</div>
  `;

  const component = createComponent(template, { id: accordionId, children, className });

  if (parsedItems.length) {
    component.useEffect((el) => {
      const handlers = [];

      const setOpen = (button, open) => {
        const heading = button.closest('h3');
        const panel = heading ? heading.nextElementSibling : null;
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
        collapsedTokens.forEach(t => button.classList.toggle(t, !open));
        if (panel) {
          if (open) {
            if (panel._closeTimer) clearTimeout(panel._closeTimer);
            if (panel._closeHandler) {
              panel.removeEventListener('transitionend', panel._closeHandler);
              panel._closeHandler = null;
            }
            panel.hidden = false;
            void panel.offsetHeight; // force reflow to allow transition from display:none
            showTokens.forEach(t => panel.classList.toggle(t, true));
            hideTokens.forEach(t => panel.classList.toggle(t, false));
          } else {
            showTokens.forEach(t => panel.classList.toggle(t, false));
            hideTokens.forEach(t => panel.classList.toggle(t, true));
            
            const duration = parseFloat(window.getComputedStyle(panel).transitionDuration) * 1000 || 0;
            if (duration > 0) {
              panel._closeHandler = (e) => {
                if (e.target === panel) {
                  panel.hidden = true;
                  panel.removeEventListener('transitionend', panel._closeHandler);
                  panel._closeHandler = null;
                  if (panel._closeTimer) clearTimeout(panel._closeTimer);
                }
              };
              panel.addEventListener('transitionend', panel._closeHandler);
              
              // Fallback for motion-reduce or cancelled transition
              panel._closeTimer = setTimeout(() => {
                panel.hidden = true;
                if (panel._closeHandler) {
                  panel.removeEventListener('transitionend', panel._closeHandler);
                  panel._closeHandler = null;
                }
              }, duration + 50);
            } else {
              panel.hidden = true;
            }
          }
        }
      };

      const buttons = el.querySelectorAll('[data-accordion-index]');
      buttons.forEach(button => {
        const handler = () => {
          const isOpen = button.getAttribute('aria-expanded') === 'true';
          if (!multiple && !isOpen) {
            buttons.forEach(other => {
              if (other !== button && other.getAttribute('aria-expanded') === 'true') {
                setOpen(other, false);
              }
            });
          }
          setOpen(button, !isOpen);
          if (onToggle) {
            onToggle({ index: parseInt(button.getAttribute('data-accordion-index'), 10), open: !isOpen });
          }
        };
        button.addEventListener('click', handler);
        handlers.push({ element: button, handler });
      });

      return () => {
        handlers.forEach(({ element, handler }) => {
          element.removeEventListener('click', handler);
        });
      };
    });
  }

  return component;
}
