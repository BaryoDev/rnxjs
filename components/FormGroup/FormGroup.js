import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

let formGroupUid = 0;

/**
 * FormGroup Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Wrapper for form elements with label, help and error text support.
 * Automatically associates the label and help/error text with the first
 * form control in the slot when no explicit forId is given.
 *
 * @param {Object} [props={}] - Component properties
 * @param {string} [props.label=''] - Label text
 * @param {string} [props.forId=''] - ID of the associated form element
 * @param {string} [props.help=''] - Help text linked via aria-describedby
 * @param {string} [props.error=''] - Error text linked via aria-describedby (sets aria-invalid)
 * @param {*} [props.children=''] - Form element content
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} FormGroup element
 */
export function FormGroup({ label = '', forId = '', help = '', error = '', children = '', className = '' } = {}) {
  const uid = `formgroup-${++formGroupUid}`;
  const helpId = `${uid}-help`;
  const errorId = `${uid}-error`;

  // Resolve classes from active theme
  const groupClass = cn(resolveClasses('formgroup'), className);
  const labelClass = resolvePartClasses('formgroup', 'label');
  const helpClass = resolvePartClasses('formgroup', 'help');
  const errorClass = resolvePartClasses('formgroup', 'error');

  const template = () => `
    <div class="${groupClass}">
      ${label ? `<label class="${labelClass}" data-ref="label" ${forId ? `for="${escapeHtml(forId)}"` : ''}>${escapeHtml(label)}</label>` : ''}
      <div data-slot></div>
      ${help ? `<div id="${escapeHtml(helpId)}" class="${helpClass}">${escapeHtml(help)}</div>` : ''}
      ${error ? `<div id="${escapeHtml(errorId)}" class="${errorClass}">${escapeHtml(error)}</div>` : ''}
    </div>
  `;

  const component = createComponent(template, { label, forId, help, error, children, className });

  component.useEffect(() => {
    // Associate label and help/error text with the first slotted form control
    const field = component.querySelector('input, select, textarea');
    if (!field) return;

    if (label && !forId && component.refs.label) {
      if (!field.id) field.id = `${uid}-field`;
      component.refs.label.setAttribute('for', field.id);
    }

    const describedBy = [help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ');
    if (describedBy) {
      const existing = field.getAttribute('aria-describedby');
      field.setAttribute('aria-describedby', existing ? `${existing} ${describedBy}` : describedBy);
    }
    if (error) {
      field.setAttribute('aria-invalid', 'true');
    }
  });

  return component;
}
