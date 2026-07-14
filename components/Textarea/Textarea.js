import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

let textareaUid = 0;

const isTrue = (v) => v === true || v === 'true' || v === '';

/**
 * Textarea Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} [props={}] - Component properties
 * @param {string} [props.label=''] - Label text (associated via for/id)
 * @param {string} [props.name=''] - Textarea name attribute
 * @param {string} [props.value=''] - Initial value
 * @param {number} [props.rows=4] - Number of visible rows
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {string} [props.size=''] - Textarea size (sm, md, lg)
 * @param {boolean} [props.required=false] - Required field
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.readonly=false] - Readonly state
 * @param {boolean} [props.invalid=false] - Invalid state (sets aria-invalid)
 * @param {string} [props.help=''] - Help text linked via aria-describedby
 * @param {string} [props.error=''] - Error text linked via aria-describedby (implies invalid)
 * @param {Function} [props.onchange] - Change event handler
 * @param {string} [props.id] - Textarea HTML id attribute (auto-generated if omitted)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Textarea element
 *
 * @example
 * // Basic usage
 * <Textarea name="description" placeholder="Enter description..." />
 *
 * @example
 * // With label and help text
 * <Textarea label="Bio" help="Tell us about yourself" rows={8} />
 */
export function Textarea({
  label = '',
  name = '',
  value = '',
  rows = 4,
  placeholder = '',
  size = '',
  required = false,
  disabled = false,
  readonly = false,
  invalid = false,
  help = '',
  error = '',
  onchange,
  id,
  className = '',
  ...rest
} = {}) {
  const attrs = Object.entries(rest).map(([k, v]) => {
    if (k === 'class' || k === 'className') return '';
    if (typeof v !== 'string' || !/^[a-zA-Z_][\w-]*$/.test(k)) return '';
    return `${k}="${escapeHtml(v)}"`;
  }).filter(Boolean).join(' ');

  const isRequired = isTrue(required);
  const isDisabled = isTrue(disabled);
  const isReadonly = isTrue(readonly);
  const isInvalid = isTrue(invalid) || !!error;

  const finalId = id || `textarea-${++textareaUid}`;
  const helpId = `${finalId}-help`;
  const errorId = `${finalId}-error`;
  const describedBy = [help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ');

  // Resolve classes from active theme
  const textareaClass = cn(
    resolveClasses('textarea', {
      size: size || 'md',
      disabled: isDisabled,
      readonly: isReadonly
    }),
    className
  );

  const labelClass = resolvePartClasses('input', 'label');
  const helpClass = resolvePartClasses('input', 'help') || resolvePartClasses('formgroup', 'help');
  const errorClass = resolvePartClasses('input', 'error') || resolvePartClasses('formgroup', 'error');

  const field = `
    <textarea
      class="${textareaClass}"
      id="${escapeHtml(finalId)}"
      name="${escapeHtml(name)}"
      rows="${Number(rows) || 4}"
      placeholder="${escapeHtml(placeholder)}"
      ${isRequired ? 'required aria-required="true"' : ''}
      ${isDisabled ? 'disabled' : ''}
      ${isReadonly ? 'readonly' : ''}
      ${isInvalid ? 'aria-invalid="true"' : ''}
      ${describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : ''}
      data-ref="textarea"
      data-rnx-ignore="true"
      ${attrs}
    >${escapeHtml(value)}</textarea>
  `;

  // Keep the bare textarea as root when no label/help/error (backward compatible)
  const template = () => (label || help || error) ? `
    <div>
      ${label ? `<label for="${escapeHtml(finalId)}" class="${labelClass}">${escapeHtml(label)}</label>` : ''}
      ${field}
      ${help ? `<div id="${escapeHtml(helpId)}" class="${helpClass}">${escapeHtml(help)}</div>` : ''}
      ${error ? `<div id="${escapeHtml(errorId)}" class="${errorClass}">${escapeHtml(error)}</div>` : ''}
    </div>
  ` : field;

  const textarea = createComponent(template, { label, name, value, rows, placeholder, required, disabled });

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
