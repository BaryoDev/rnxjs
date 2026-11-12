import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml, escapeAttr } from '../../utils/security.js';
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
    <div class="${escapeAttr(wrapperClass)}">
      ${label ? `<label for="${escapeHtml(finalId)}" class="${escapeAttr(labelClass)}">${escapeHtml(label)}</label>` : ''}
      <input type="range" class="${escapeAttr(inputClass)}"
             id="${escapeHtml(finalId)}"
             ${name ? `name="${escapeHtml(name)}"` : ''}
             min="${escapeAttr(minVal)}" max="${escapeAttr(maxVal)}" step="${escapeAttr(stepVal)}" value="${escapeAttr(numOr(value, 0))}"
             aria-valuemin="${escapeAttr(minVal)}" aria-valuemax="${escapeAttr(maxVal)}" aria-valuenow="${escapeAttr(numOr(value, 0))}"
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
