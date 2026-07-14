import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * FormGroup Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Wrapper for form elements with label support.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.label=''] - Label text
 * @param {string} [props.forId=''] - ID of the associated form element
 * @param {*} [props.children=''] - Form element content
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} FormGroup element
 */
export function FormGroup({ label = '', forId = '', children = '', className = '' }) {
  // Resolve classes from active theme
  const groupClass = cn(resolveClasses('formgroup'), 'mb-3', className);
  const labelClass = resolvePartClasses('formgroup', 'label') || 'form-label';

  const template = () => `
    <div class="${groupClass}">
      ${label ? `<label class="${labelClass}" for="${escapeHtml(forId)}">${escapeHtml(label)}</label>` : ''}
      <div data-slot></div>
    </div>
  `;

  return createComponent(template, { label, forId, children, className });
}
