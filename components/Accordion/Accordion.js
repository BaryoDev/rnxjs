import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Accordion Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Collapsible accordion container for items.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.id='accordion'] - Accordion ID for collapse targeting
 * @param {*} [props.children=''] - Accordion items content
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Accordion element
 */
export function Accordion({ id = 'accordion', children = '', className = '' }) {
  // Resolve classes from active theme
  const accordionClass = cn(resolveClasses('accordion'), 'accordion', className);

  const template = () => `
    <div class="${accordionClass}" id="${escapeHtml(id)}" data-slot></div>
  `;

  return createComponent(template, { id, children, className });
}
