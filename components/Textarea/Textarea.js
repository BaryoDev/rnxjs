import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Textarea Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.name=''] - Textarea name attribute
 * @param {string} [props.value=''] - Initial value
 * @param {number} [props.rows=4] - Number of visible rows
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {string} [props.size=''] - Textarea size (sm, md, lg)
 * @param {boolean} [props.required=false] - Required field
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.readonly=false] - Readonly state
 * @param {Function} [props.onchange] - Change event handler
 * @param {string} [props.id] - Textarea HTML id attribute
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Textarea element
 *
 * @example
 * // Basic usage
 * <Textarea name="description" placeholder="Enter description..." />
 *
 * @example
 * // With more rows
 * <Textarea name="content" rows={8} />
 */
export function Textarea({
  name = '',
  value = '',
  rows = 4,
  placeholder = '',
  size = '',
  required = false,
  disabled = false,
  readonly = false,
  onchange,
  id,
  className = '',
  ...rest
}) {
  const attrs = Object.entries(rest).map(([k, v]) => {
    if (k === 'class' || k === 'className') return '';
    if (typeof v === 'string') return `${k}="${escapeHtml(v)}"`;
    return '';
  }).join(' ');

  const finalId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  // Resolve classes from active theme
  const textareaClass = cn(
    resolveClasses('textarea', {
      size: size || 'md',
      disabled,
      readonly
    }),
    className
  );

  const template = () => `
    <textarea
      class="${textareaClass}"
      id="${escapeHtml(finalId)}"
      name="${escapeHtml(name)}"
      rows="${rows}"
      placeholder="${escapeHtml(placeholder)}"
      ${required ? 'required' : ''}
      ${disabled ? 'disabled' : ''}
      ${readonly ? 'readonly' : ''}
      data-ref="textarea"
      data-rnx-ignore="true"
      ${attrs}
    >${escapeHtml(value)}</textarea>
  `;

  const textarea = createComponent(template, { name, value, rows, placeholder, required, disabled });

  textarea.useEffect(() => {
    if (onchange) {
      textarea.refs.textarea.addEventListener('change', onchange);
      return () => {
        if (textarea.refs && textarea.refs.textarea) {
          textarea.refs.textarea.removeEventListener('change', onchange);
        }
      };
    }
  });

  return textarea;
}
