import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Switch Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.label=''] - Switch label text
 * @param {boolean} [props.checked=false] - Checked/on state
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {Function} [props.onchange] - Change event handler (receives boolean)
 * @param {string} [props.id] - Switch HTML id attribute
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
  checked = false,
  disabled = false,
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

  const finalId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
  const isChecked = checked === 'true' || checked === true;

  // Resolve classes from active theme
  const switchClass = cn(
    resolveClasses('switch', {
      checked: isChecked,
      disabled
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
        id="${escapeHtml(finalId)}"
        ${isChecked ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
        data-ref="input"
        data-rnx-ignore="true"
        ${attrs}
      >
      ${label ? `<label class="${labelClass}" for="${escapeHtml(finalId)}">${escapeHtml(label)}</label>` : ''}
    </div>
  `;

  const component = createComponent(template, { label, checked, disabled });

  component.useEffect(() => {
    if (onchange && component.refs.input) {
      const handler = (e) => onchange(e.target.checked);
      component.refs.input.addEventListener('change', handler);
      return () => {
        if (component.refs && component.refs.input) {
          component.refs.input.removeEventListener('change', handler);
        }
      };
    }
  });

  return component;
}
