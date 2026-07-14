import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

let inputUid = 0;

const isTrue = (v) => v === true || v === 'true' || v === '';

/**
 * Input Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} [props={}] - Component properties
 * @param {string} [props.type='text'] - Input type (text, email, password, number, etc.)
 * @param {string} [props.label=''] - Floating label text
 * @param {string} [props.name=''] - Input name attribute
 * @param {string} [props.value=''] - Input value
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {string} [props.size=''] - Input size (sm, md, lg)
 * @param {boolean} [props.required=false] - Required field
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.readonly=false] - Readonly state
 * @param {boolean} [props.invalid=false] - Invalid state (sets aria-invalid)
 * @param {string} [props.help=''] - Help text linked via aria-describedby
 * @param {string} [props.error=''] - Error text linked via aria-describedby (implies invalid)
 * @param {string} [props.icon=''] - Icon name (Bootstrap Icons format)
 * @param {string} [props.id] - Input HTML id attribute (auto-generated if omitted)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Input element
 *
 * @example
 * // Basic usage
 * <Input type="email" label="Email" name="email" />
 *
 * @example
 * // With help and error text
 * <Input label="Email" help="We never share your email" error="Invalid email" />
 */
export function Input({
  type = 'text',
  label = '',
  name = '',
  value = '',
  placeholder = '',
  size = '',
  required = false,
  disabled = false,
  readonly = false,
  invalid = false,
  help = '',
  error = '',
  icon = '',
  id,
  className = '',
  ...rest
} = {}) {
  const attrs = Object.entries(rest).map(([k, v]) => {
    // Exclude class/className from rest attributes to avoid duplicates
    if (k === 'class' || k === 'className') return '';
    if (typeof v !== 'string' || !/^[a-zA-Z_][\w-]*$/.test(k)) return '';
    return `${k}="${escapeHtml(v)}"`;
  }).filter(Boolean).join(' ');

  const isRequired = isTrue(required);
  const isDisabled = isTrue(disabled);
  const isReadonly = isTrue(readonly);
  const isInvalid = isTrue(invalid) || !!error;

  // Generate a stable unique ID for label association
  const finalId = id || `input-${++inputUid}`;
  const helpId = `${finalId}-help`;
  const errorId = `${finalId}-error`;
  const describedBy = [help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ');

  // Resolve classes from active theme
  const inputClass = cn(
    resolveClasses('input', {
      size: size || 'md',
      disabled: isDisabled,
      readonly: isReadonly,
      error: isInvalid
    }),
    className
  );

  const wrapperClass = cn(
    resolvePartClasses('input', 'wrapper'),
    label ? resolvePartClasses('input', 'floatingWrapper') : ''
  );

  const labelClass = resolvePartClasses('input', 'label');
  const iconClass = resolvePartClasses('input', 'icon');
  const helpClass = resolvePartClasses('input', 'help') || resolvePartClasses('formgroup', 'help');
  const errorClass = resolvePartClasses('input', 'error') || resolvePartClasses('formgroup', 'error');

  const template = () => `
    <div class="${wrapperClass}">
      ${icon ? `<span class="${iconClass}" aria-hidden="true"><i class="bi bi-${escapeHtml(icon)}"></i></span>` : ''}
      <input
        class="${inputClass}"
        id="${escapeHtml(finalId)}"
        type="${escapeHtml(type)}"
        name="${escapeHtml(name)}"
        value="${escapeHtml(value)}"
        placeholder="${escapeHtml(placeholder || (label ? label : ''))}"
        ${isRequired ? 'required aria-required="true"' : ''}
        ${isDisabled ? 'disabled' : ''}
        ${isReadonly ? 'readonly' : ''}
        ${isInvalid ? 'aria-invalid="true"' : ''}
        ${describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : ''}
        data-ref="input"
        data-rnx-ignore="true"
        ${attrs}
      >
      ${label ? `<label for="${escapeHtml(finalId)}" class="${labelClass}">${escapeHtml(label)}</label>` : ''}
      ${help ? `<div id="${escapeHtml(helpId)}" class="${helpClass}">${escapeHtml(help)}</div>` : ''}
      ${error ? `<div id="${escapeHtml(errorId)}" class="${errorClass}">${escapeHtml(error)}</div>` : ''}
    </div>
  `;

  const input = createComponent(template, { type, label, name, value, placeholder, required, disabled, icon, ...rest });

  input.useEffect(() => {
    // Re-attach listeners if passed in rest (e.g. onchange, oninput)
    const validEvents = ['onchange', 'oninput', 'onblur', 'onfocus'];
    validEvents.forEach(evt => {
      if (rest[evt] && typeof rest[evt] === 'function') {
        const eventName = evt.substring(2);
        input.refs.input.addEventListener(eventName, rest[evt]);
      }
    });

    return () => {
      validEvents.forEach(evt => {
        if (rest[evt] && typeof rest[evt] === 'function') {
          const eventName = evt.substring(2);
          if (input.refs && input.refs.input) input.refs.input.removeEventListener(eventName, rest[evt]);
        }
      });
    }
  });

  return input;
}
