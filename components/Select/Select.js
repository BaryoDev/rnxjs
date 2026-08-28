import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

let selectUid = 0;

const isTrue = (v) => v === true || v === 'true' || v === '';

/**
 * Select Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Supports Blazor-style class customization via the className prop.
 *
 * @param {Object} [props={}] - Component properties
 * @param {string} [props.name=''] - Select name attribute
 * @param {string} [props.label=''] - Label text (associated via for/id)
 * @param {string|Array} [props.options=''] - Options array or JSON string [{value, label}] (plain strings allowed)
 * @param {string} [props.value=''] - Selected value
 * @param {string} [props.size=''] - Select size (sm, md, lg)
 * @param {boolean} [props.required=false] - Required field
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.invalid=false] - Invalid state (sets aria-invalid)
 * @param {string} [props.help=''] - Help text linked via aria-describedby
 * @param {string} [props.error=''] - Error text linked via aria-describedby (implies invalid)
 * @param {Function} [props.onchange] - Change event handler
 * @param {string} [props.id] - Select HTML id attribute (auto-generated if omitted)
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
 */
export function Select({
  name = '',
  label = '',
  options = '',
  value = '',
  size = '',
  required = false,
  disabled = false,
  invalid = false,
  help = '',
  error = '',
  onchange,
  id,
  className = '',
  children = [],
  ...rest
} = {}) {
  const attrs = Object.entries(rest).map(([k, v]) => {
    if (k === 'class' || k === 'className') return '';
    if (typeof v !== 'string' || !/^[a-zA-Z_][\w-]*$/.test(k)) return '';
    return `${k}="${escapeHtml(v)}"`;
  }).filter(Boolean).join(' ');

  let parsedOptions = [];
  try {
    parsedOptions = typeof options === 'string' ? (options ? JSON.parse(options) : []) : options;
  } catch {
    parsedOptions = [];
  }
  if (!Array.isArray(parsedOptions)) parsedOptions = [];
  // Forgiving: allow plain string/number options
  parsedOptions = parsedOptions.map(opt =>
    (opt !== null && typeof opt === 'object') ? opt : { value: opt, label: opt }
  );

  const isRequired = isTrue(required);
  const isDisabled = isTrue(disabled);
  const isInvalid = isTrue(invalid) || !!error;

  const finalId = id || `select-${++selectUid}`;
  const helpId = `${finalId}-help`;
  const errorId = `${finalId}-error`;
  const describedBy = [help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ');

  // Resolve classes from active theme
  const selectClass = cn(
    resolveClasses('select', {
      size: size || 'md',
      disabled: isDisabled
    }),
    className
  );

  const wrapperClass = label ? resolvePartClasses('input', 'floatingWrapper') : '';
  const labelClass = resolvePartClasses('input', 'label');
  const helpClass = resolvePartClasses('input', 'help') || resolvePartClasses('formgroup', 'help');
  const errorClass = resolvePartClasses('input', 'error') || resolvePartClasses('formgroup', 'error');

  const template = () => `
    <div class="${wrapperClass}">
      <select
        class="${selectClass}"
        id="${escapeHtml(finalId)}"
        name="${escapeHtml(name)}"
        ${isRequired ? 'required aria-required="true"' : ''}
        ${isDisabled ? 'disabled' : ''}
        ${isInvalid ? 'aria-invalid="true"' : ''}
        ${describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : ''}
        data-ref="select"
        data-rnx-ignore="true"
        ${parsedOptions.length === 0 ? 'data-slot' : ''}
        ${attrs}
      >
        ${parsedOptions.map(opt => `
          <option value="${escapeHtml(opt.value)}" ${opt.value === value ? 'selected' : ''}>
            ${escapeHtml(opt.label)}
          </option>
        `).join('')}
      </select>
      ${label ? `<label for="${escapeHtml(finalId)}" class="${labelClass}">${escapeHtml(label)}</label>` : ''}
      ${help ? `<div id="${escapeHtml(helpId)}" class="${helpClass}">${escapeHtml(help)}</div>` : ''}
      ${error ? `<div id="${escapeHtml(errorId)}" class="${errorClass}">${escapeHtml(error)}</div>` : ''}
    </div>
  `;

  const select = createComponent(template, { name, label, options, value, required, disabled, children });

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
