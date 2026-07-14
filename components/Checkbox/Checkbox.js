import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Checkbox Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.label=''] - Checkbox label text
 * @param {string} [props.name=''] - Checkbox name attribute
 * @param {string} [props.value=''] - Checkbox value
 * @param {boolean} [props.checked=false] - Checked state
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.required=false] - Required field
 * @param {Function} [props.onchange] - Change event handler
 * @param {string} [props.id] - Checkbox HTML id attribute
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Checkbox element
 *
 * @example
 * // Basic usage
 * <Checkbox label="Accept terms" name="terms" />
 *
 * @example
 * // Checked by default
 * <Checkbox label="Subscribe" name="subscribe" checked={true} />
 *
 * @example
 * // With custom classes
 * <Checkbox label="Option" className="my-checkbox" />
 */
export function Checkbox({
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

  const finalId = id || `check-${Math.random().toString(36).substr(2, 9)}`;
  const isChecked = checked === 'true' || checked === true;

  // Resolve classes from active theme
  const checkboxClass = cn(
    resolveClasses('checkbox', {
      checked: isChecked,
      disabled
    }),
    className
  );

  const wrapperClass = resolvePartClasses('checkbox', 'wrapper');
  const labelClass = resolvePartClasses('checkbox', 'label');

  const template = () => `
    <div class="${wrapperClass}">
      <input
        class="${checkboxClass}"
        type="checkbox"
        id="${escapeHtml(finalId)}"
        name="${escapeHtml(name)}"
        value="${escapeHtml(value)}"
        ${isChecked ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
        ${required ? 'required' : ''}
        data-ref="checkbox"
        data-rnx-ignore="true"
        ${attrs}
      />
      <label class="${labelClass}" for="${escapeHtml(finalId)}">
        ${escapeHtml(label)}
      </label>
    </div>
  `;

  const checkbox = createComponent(template, { label, name, value, checked, disabled, required });

  checkbox.useEffect(() => {
    if (onchange) {
      checkbox.refs.checkbox.addEventListener('change', onchange);
      return () => {
        if (checkbox.refs && checkbox.refs.checkbox) {
          checkbox.refs.checkbox.removeEventListener('change', onchange);
        }
      };
    }
  });

  return checkbox;
}
