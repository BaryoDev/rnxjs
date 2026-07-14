import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Select Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.name=''] - Select name attribute
 * @param {string} [props.label=''] - Floating label text
 * @param {string|Array} [props.options=''] - Options array or JSON string [{value, label}]
 * @param {string} [props.value=''] - Selected value
 * @param {string} [props.size=''] - Select size (sm, md, lg)
 * @param {boolean} [props.required=false] - Required field
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {Function} [props.onchange] - Change event handler
 * @param {string} [props.id] - Select HTML id attribute
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Select element
 *
 * @example
 * // Basic usage
 * <Select name="country" options='[{"value":"us","label":"USA"},{"value":"uk","label":"UK"}]' />
 *
 * @example
 * // With label
 * <Select name="status" label="Status" options={statusOptions} />
 *
 * @example
 * // With custom classes
 * <Select name="type" className="my-custom-select" />
 */
export function Select({
  name = '',
  label = '',
  options = '',
  value = '',
  size = '',
  required = false,
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

  let parsedOptions = [];
  try {
    parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
  } catch {
    parsedOptions = [];
  }

  const finalId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  // Resolve classes from active theme
  const selectClass = cn(
    resolveClasses('select', {
      size: size || 'md',
      disabled
    }),
    className
  );

  const wrapperClass = label ? resolvePartClasses('input', 'floatingWrapper') : '';
  const labelClass = resolvePartClasses('input', 'label');

  const template = () => `
    <div class="${wrapperClass}">
      <select
        class="${selectClass}"
        id="${escapeHtml(finalId)}"
        name="${escapeHtml(name)}"
        ${required ? 'required' : ''}
        ${disabled ? 'disabled' : ''}
        data-ref="select"
        data-rnx-ignore="true"
        ${attrs}
      >
        ${parsedOptions.map(opt => `
          <option value="${escapeHtml(opt.value)}" ${opt.value === value ? 'selected' : ''}>
            ${escapeHtml(opt.label)}
          </option>
        `).join('')}
      </select>
      ${label ? `<label for="${escapeHtml(finalId)}" class="${labelClass}">${escapeHtml(label)}</label>` : ''}
    </div>
  `;

  const select = createComponent(template, { name, label, options, value, required, disabled });

  select.useEffect(() => {
    if (onchange) {
      select.refs.select.addEventListener('change', onchange);
      return () => {
        if (select.refs && select.refs.select) select.refs.select.removeEventListener('change', onchange);
      };
    }
  });

  return select;
}
