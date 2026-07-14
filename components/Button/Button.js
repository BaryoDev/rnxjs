import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Button Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} [props={}] - Component properties
 * @param {string} [props.label=''] - Button text label
 * @param {string} [props.variant='filled'] - Button variant (filled, outlined, text, elevated, tonal, primary, secondary, success, danger, warning, info, light, dark)
 * @param {string} [props.size=''] - Button size (sm, md, lg)
 * @param {string} [props.icon=''] - Icon name (Bootstrap Icons format)
 * @param {boolean} [props.block=false] - Full width button
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string|Function} [props.onclick] - Click handler
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @param {Object} [props.rest] - Additional HTML attributes
 * @returns {HTMLElement} Button element
 *
 * @example
 * // Basic usage
 * <Button label="Click me" variant="primary" />
 *
 * @example
 * // With custom classes (Blazor-style)
 * <Button label="Custom" className="my-custom-class" />
 *
 * @example
 * // Full width button
 * <Button label="Submit" variant="success" block={true} />
 */
export function Button({
  label = '',
  variant = 'filled',
  size = '',
  icon = '',
  block = false,
  disabled = false,
  onclick,
  className = '',
  children,
  ...rest
} = {}) {
  // Resolve classes from active theme
  const btnClass = cn(
    resolveClasses('button', {
      variant,
      size: size || 'md',
      block,
      disabled
    }),
    className // User classes applied last (highest priority)
  );

  const iconClass = cn(resolveClasses('icon'), icon ? `bi bi-${icon}` : '');

  const clickAttr = (typeof onclick === 'string') ? `onclick="${escapeHtml(onclick)}"` : '';

  // Icon-only buttons need an accessible name
  const needsAriaLabel = icon && !label && !rest['aria-label'] && !rest['aria-labelledby'];
  const ariaLabelAttr = needsAriaLabel ? `aria-label="${escapeHtml(icon)}"` : '';

  // Create attribute string from rest props (drop unsafe attribute names)
  const restAttrs = Object.entries(rest)
    .filter(([key]) => /^[a-zA-Z][a-zA-Z0-9:_-]*$/.test(key))
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ');

  const template = () => `
    <button
      class="${escapeHtml(btnClass)}"
      type="button"
      data-ref="btn"
      data-rnx-ignore="true"
      ${disabled ? 'disabled' : ''}
      ${ariaLabelAttr}
      ${clickAttr}
      ${restAttrs}
    >
      ${icon ? `<i class="${escapeHtml(iconClass)}" aria-hidden="true"></i>` : ''}
      ${escapeHtml(label)}
      <span data-slot></span>
    </button>
  `;

  const btn = createComponent(template, { label, variant, size, icon, block, children, ...rest });

  btn.useEffect(() => {
    if (typeof onclick === 'function' && btn.refs && btn.refs.btn) {
      const handler = onclick;
      btn.refs.btn.addEventListener('click', handler);
      return () => {
        if (btn.refs && btn.refs.btn) {
          btn.refs.btn.removeEventListener('click', handler);
        }
      };
    }
  });

  return btn;
}
