import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Input Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.type='text'] - Input type (text, email, password, number, etc.)
 * @param {string} [props.label=''] - Floating label text
 * @param {string} [props.name=''] - Input name attribute
 * @param {string} [props.value=''] - Input value
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {string} [props.size=''] - Input size (sm, md, lg)
 * @param {boolean} [props.required=false] - Required field
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.readonly=false] - Readonly state
 * @param {string} [props.icon=''] - Icon name (Bootstrap Icons format)
 * @param {string} [props.id] - Input HTML id attribute
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Input element
 *
 * @example
 * // Basic usage
 * <Input type="email" label="Email" name="email" />
 *
 * @example
 * // With icon
 * <Input type="text" icon="search" placeholder="Search..." />
 *
 * @example
 * // With custom classes
 * <Input type="text" className="my-custom-input" />
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
  icon = '',
  id,
  className = '',
  ...rest
}) {
  const attrs = Object.entries(rest).map(([k, v]) => {
    // Exclude class/className from rest attributes to avoid duplicates
    if (k === 'class' || k === 'className') return '';
    if (typeof v === 'string') return `${k}="${escapeHtml(v)}"`;
    return '';
  }).join(' ');

  // Generate ID for floating label
  const finalId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Resolve classes from active theme
  const inputClass = cn(
    resolveClasses('input', {
      size: size || 'md',
      disabled,
      readonly
    }),
    icon ? 'border-start-0 ps-0 border-l-0 pl-0' : '', // Support both Bootstrap and Tailwind
    className
  );

  const wrapperClass = cn(
    resolvePartClasses('input', 'wrapper'),
    label ? resolvePartClasses('input', 'floatingWrapper') : ''
  );

  const labelClass = resolvePartClasses('input', 'label');
  const iconClass = resolvePartClasses('input', 'icon');

  const template = () => `
    <div class="${wrapperClass}">
      ${icon ? `<span class="${iconClass}"><i class="bi bi-${escapeHtml(icon)}"></i></span>` : ''}
      <input
        class="${inputClass}"
        id="${escapeHtml(finalId)}"
        type="${escapeHtml(type)}"
        name="${escapeHtml(name)}"
        value="${escapeHtml(value)}"
        placeholder="${escapeHtml(placeholder || (label ? label : ''))}"
        ${required ? 'required' : ''}
        ${disabled ? 'disabled' : ''}
        ${readonly ? 'readonly' : ''}
        data-ref="input"
        data-rnx-ignore="true"
        ${attrs}
      >
      ${label ? `<label for="${escapeHtml(finalId)}" class="${labelClass}">${escapeHtml(label)}</label>` : ''}
    </div>
  `;

  const input = createComponent(template, { type, label, name, value, placeholder, required, disabled, icon, ...rest });

  input.useEffect(() => {
    // Re-attach listeners if passed in rest (e.g. onchange, oninput)
    // Note: This is a simplified approach. In a real reactive system, we'd bind properly.
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
