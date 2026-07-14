import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Slider Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Range input slider with Material Design styling.
 *
 * @param {Object} props - Component properties
 * @param {number} [props.value=0] - Current value
 * @param {number} [props.min=0] - Minimum value
 * @param {number} [props.max=100] - Maximum value
 * @param {number} [props.step=1] - Step increment
 * @param {Function} [props.oninput] - Called when value changes
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Slider element
 */
export function Slider({ value = 0, min = 0, max = 100, step = 1, oninput, className = '' }) {
    // Resolve classes from active theme
    const wrapperClass = cn(
        resolveClasses('slider'),
        'd-flex flex align-items-center items-center',
        className
    );
    const inputClass = resolvePartClasses('slider', 'input') || 'form-range';

    const template = ({ value }) => `
    <div class="${wrapperClass}" style="height: 40px;">
      <input type="range" class="${inputClass}"
             min="${escapeHtml(String(min))}" max="${escapeHtml(String(max))}" step="${escapeHtml(String(step))}" value="${escapeHtml(String(value))}"
             data-ref="range"
             data-rnx-ignore="true"
             style="accent-color: var(--md-sys-color-primary);">
    </div>
  `;

    const component = createComponent(template, { value, min, max, step, className });

    component.useEffect(() => {
        // MEMORY LEAK FIX: Store handler for cleanup
        let handler = null;

        if (oninput && component.refs.range) {
            handler = (e) => {
                oninput(e.target.value);
            };
            component.refs.range.addEventListener('input', handler);
        }

        // Cleanup
        return () => {
            if (handler && component.refs.range) {
                component.refs.range.removeEventListener('input', handler);
            }
        };
    });

    return component;
}
