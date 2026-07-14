import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

let sliderUid = 0;

const isTrue = (v) => v === true || v === 'true' || v === '';
const numOr = (v, fallback) => {
    const n = Number(v);
    return (v === '' || v === null || v === undefined || Number.isNaN(n)) ? fallback : n;
};

/**
 * Slider Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Range input slider with proper ARIA value attributes.
 *
 * @param {Object} [props={}] - Component properties
 * @param {number} [props.value=0] - Current value
 * @param {number} [props.min=0] - Minimum value
 * @param {number} [props.max=100] - Maximum value
 * @param {number} [props.step=1] - Step increment
 * @param {string} [props.label=''] - Label text (associated via for/id)
 * @param {string} [props.name=''] - Input name attribute
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {Function} [props.oninput] - Called when value changes
 * @param {string} [props.id] - Input HTML id attribute (auto-generated if omitted)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Slider element
 */
export function Slider({
    value = 0,
    min = 0,
    max = 100,
    step = 1,
    label = '',
    name = '',
    disabled = false,
    oninput,
    id,
    className = '',
    ...rest
} = {}) {
    const attrs = Object.entries(rest).map(([k, v]) => {
        if (k === 'class' || k === 'className') return '';
        if (typeof v !== 'string' || !/^[a-zA-Z_][\w-]*$/.test(k)) return '';
        return `${k}="${escapeHtml(v)}"`;
    }).filter(Boolean).join(' ');

    const finalId = id || `slider-${++sliderUid}`;
    const isDisabled = isTrue(disabled);
    const minVal = numOr(min, 0);
    const maxVal = numOr(max, 100);
    const stepVal = numOr(step, 1);

    // Resolve classes from active theme (slider classes belong on the range input)
    const inputClass = resolveClasses('slider', { disabled: isDisabled });
    const labelClass = resolvePartClasses('input', 'label');
    const wrapperClass = cn('rnx-slider', className);

    const template = ({ value }) => `
    <div class="${wrapperClass}">
      ${label ? `<label for="${escapeHtml(finalId)}" class="${labelClass}">${escapeHtml(label)}</label>` : ''}
      <input type="range" class="${inputClass}"
             id="${escapeHtml(finalId)}"
             ${name ? `name="${escapeHtml(name)}"` : ''}
             min="${minVal}" max="${maxVal}" step="${stepVal}" value="${numOr(value, 0)}"
             aria-valuemin="${minVal}" aria-valuemax="${maxVal}" aria-valuenow="${numOr(value, 0)}"
             ${isDisabled ? 'disabled' : ''}
             data-ref="range"
             data-rnx-ignore="true"
             ${attrs}>
    </div>
  `;

    const component = createComponent(template, { value, min, max, step, className });

    component.useEffect(() => {
        const range = component.refs.range;
        if (!range) return;

        const handler = (e) => {
            e.target.setAttribute('aria-valuenow', e.target.value);
            if (oninput) oninput(e.target.value);
        };
        range.addEventListener('input', handler);

        return () => {
            if (component.refs && component.refs.range) {
                component.refs.range.removeEventListener('input', handler);
            }
        };
    });

    return component;
}
