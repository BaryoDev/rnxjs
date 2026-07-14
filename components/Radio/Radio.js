import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

let radioUid = 0;

const isTrue = (v) => v === true || v === 'true' || v === '';

/**
 * Radio Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} [props={}] - Component properties
 * @param {string} [props.label=''] - Radio label text
 * @param {string} [props.name=''] - Radio group name
 * @param {string} [props.value=''] - Radio value
 * @param {boolean} [props.checked=false] - Checked state
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.required=false] - Required field
 * @param {boolean} [props.invalid=false] - Invalid state (sets aria-invalid)
 * @param {string} [props.help=''] - Help text linked via aria-describedby
 * @param {string} [props.error=''] - Error text linked via aria-describedby (implies invalid)
 * @param {Function} [props.onchange] - Change event handler
 * @param {string} [props.id] - Radio HTML id attribute (auto-generated if omitted)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Radio element
 *
 * @example
 * // Basic usage
 * <Radio label="Option A" name="options" value="a" />
 *
 * @example
 * // Pre-selected
 * <Radio label="Yes" name="confirm" value="yes" checked={true} />
 */
export function Radio({
  label = '',
  name = '',
  value = '',
  checked = false,
  disabled = false,
  required = false,
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

  const finalId = id || `radio-${++radioUid}`;
  const isChecked = isTrue(checked);
  const isDisabled = isTrue(disabled);
  const isRequired = isTrue(required);
  const isInvalid = isTrue(invalid) || !!error;

  const helpId = `${finalId}-help`;
  const errorId = `${finalId}-error`;
  const describedBy = [help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ');

  // Resolve classes from active theme
  const radioClass = cn(
    resolveClasses('radio', {
      checked: isChecked,
      disabled: isDisabled
    }),
    className
  );

  const wrapperClass = resolvePartClasses('radio', 'wrapper');
  const labelClass = resolvePartClasses('radio', 'label');
  const helpClass = resolvePartClasses('input', 'help') || resolvePartClasses('formgroup', 'help');
  const errorClass = resolvePartClasses('input', 'error') || resolvePartClasses('formgroup', 'error');

  const field = `
    <div class="${wrapperClass}">
      <input
        class="${radioClass}"
        type="radio"
        id="${escapeHtml(finalId)}"
        name="${escapeHtml(name)}"
        value="${escapeHtml(value)}"
        ${isChecked ? 'checked' : ''}
        ${isDisabled ? 'disabled' : ''}
        ${isRequired ? 'required aria-required="true"' : ''}
        ${isInvalid ? 'aria-invalid="true"' : ''}
        ${describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : ''}
        data-ref="radio"
        data-rnx-ignore="true"
        ${attrs}
      />
      <label class="${labelClass}" for="${escapeHtml(finalId)}">
        ${escapeHtml(label)}
      </label>
    </div>
  `;

  // Keep the wrapper as root when no help/error (backward compatible)
  const template = () => (help || error) ? `
    <div>
      ${field}
      ${help ? `<div id="${escapeHtml(helpId)}" class="${helpClass}">${escapeHtml(help)}</div>` : ''}
      ${error ? `<div id="${escapeHtml(errorId)}" class="${errorClass}">${escapeHtml(error)}</div>` : ''}
    </div>
  ` : field;

  const radio = createComponent(template, { label, name, value, checked, disabled, required });

  radio.useEffect(() => {
    if (onchange) {
      radio.refs.radio.addEventListener('change', onchange);
      return () => {
        if (radio.refs && radio.refs.radio) {
          radio.refs.radio.removeEventListener('change', onchange);
        }
      };
    }
  });

  return radio;
}
