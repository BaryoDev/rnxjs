import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

let switchUid = 0;

const isTrue = (v) => v === true || v === 'true' || v === '';

/**
 * Switch Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} [props={}] - Component properties
 * @param {string} [props.label=''] - Switch label text
 * @param {string} [props.name=''] - Switch name attribute
 * @param {string} [props.value=''] - Switch value attribute
 * @param {boolean} [props.checked=false] - Checked/on state
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.required=false] - Required field
 * @param {Function} [props.onchange] - Change event handler (receives boolean)
 * @param {string} [props.id] - Switch HTML id attribute (auto-generated if omitted)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Switch element
 *
 * @example
 * // Basic usage
 * <Switch label="Enable notifications" />
 *
 * @example
 * // With handler
 * <Switch label="Dark mode" onchange={(checked) => setDarkMode(checked)} />
 */
export function Switch({
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
} = {}) {
  const attrs = Object.entries(rest).map(([k, v]) => {
    if (k === 'class' || k === 'className') return '';
    if (typeof v !== 'string' || !/^[a-zA-Z_][\w-]*$/.test(k)) return '';
    return `${k}="${escapeHtml(v)}"`;
  }).filter(Boolean).join(' ');

  const finalId = id || `switch-${++switchUid}`;
  const isChecked = isTrue(checked);
  const isDisabled = isTrue(disabled);
  const isRequired = isTrue(required);

  // Resolve classes from active theme
  const switchClass = cn(
    resolveClasses('switch', {
      checked: isChecked,
      unchecked: !isChecked,
      disabled: isDisabled
    }),
    className
  );

  const wrapperClass = resolvePartClasses('switch', 'wrapper');
  const labelClass = resolvePartClasses('switch', 'label');

  const template = () => `
    <div class="${wrapperClass}">
      <input
        class="${switchClass}"
        type="checkbox"
        role="switch"
        aria-checked="${isChecked ? 'true' : 'false'}"
        id="${escapeHtml(finalId)}"
        ${name ? `name="${escapeHtml(name)}"` : ''}
        ${value ? `value="${escapeHtml(value)}"` : ''}
        ${isChecked ? 'checked' : ''}
        ${isDisabled ? 'disabled' : ''}
        ${isRequired ? 'required aria-required="true"' : ''}
        data-ref="input"
        data-rnx-ignore="true"
        ${attrs}
      >
      ${label ? `<label class="${labelClass}" for="${escapeHtml(finalId)}">${escapeHtml(label)}</label>` : ''}
    </div>
  `;

  const component = createComponent(template, { label, checked, disabled });

  component.useEffect(() => {
    const input = component.refs.input;
    if (!input) return;

    const handler = (e) => {
      e.target.setAttribute('aria-checked', e.target.checked ? 'true' : 'false');
      if (onchange) onchange(e.target.checked);
    };
    input.addEventListener('change', handler);

    return () => {
      if (component.refs && component.refs.input) {
        component.refs.input.removeEventListener('change', handler);
      }
    };
  });

  return component;
}
