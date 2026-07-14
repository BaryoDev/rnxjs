import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Radio Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.label=''] - Radio label text
 * @param {string} [props.name=''] - Radio group name
 * @param {string} [props.value=''] - Radio value
 * @param {boolean} [props.checked=false] - Checked state
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.required=false] - Required field
 * @param {Function} [props.onchange] - Change event handler
 * @param {string} [props.id] - Radio HTML id attribute
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

  const finalId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
  const isChecked = checked === 'true' || checked === true;

  // Resolve classes from active theme
  const radioClass = cn(
    resolveClasses('radio', {
      checked: isChecked,
      disabled
    }),
    className
  );

  const wrapperClass = resolvePartClasses('radio', 'wrapper');
  const labelClass = resolvePartClasses('radio', 'label');

  const template = () => `
    <div class="${wrapperClass}">
      <input
        class="${radioClass}"
        type="radio"
        id="${escapeHtml(finalId)}"
        name="${escapeHtml(name)}"
        value="${escapeHtml(value)}"
        ${isChecked ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
        ${required ? 'required' : ''}
        data-ref="radio"
        data-rnx-ignore="true"
        ${attrs}
      />
      <label class="${labelClass}" for="${escapeHtml(finalId)}">
        ${escapeHtml(label)}
      </label>
    </div>
  `;

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
