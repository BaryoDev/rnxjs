import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * SegmentedButton Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Material Design 3 segmented button for exclusive selection.
 *
 * @param {Object} props - Component properties
 * @param {Array|string} [props.options=[]] - Button options [{label, value, icon}]
 * @param {string} [props.selected=''] - Currently selected value
 * @param {Function} [props.onchange] - Called when selection changes
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} SegmentedButton element
 */
export function SegmentedButton({ options = [], selected = '', onchange, className = '' }) {
  // Parse options if passed as string
  let parsedOptions = options;
  if (typeof options === 'string') {
    try {
      parsedOptions = JSON.parse(options);
    } catch (e) {
      console.warn('[rnxJS] SegmentedButton: invalid options format', options);
      parsedOptions = [];
    }
  }

  // Resolve classes from active theme
  const groupClass = cn(
    resolveClasses('segmentedbutton'),
    'btn-group',
    className
  );
  const buttonClass = resolvePartClasses('segmentedbutton', 'button') || 'btn btn-outline-secondary border-0';
  const activeClass = resolvePartClasses('segmentedbutton', 'active') || 'active bg-secondary-subtle text-secondary-emphasis';

  const template = ({ selected, options }) => `
    <div class="${groupClass}" role="group" style="border: 1px solid var(--md-sys-color-outline); border-radius: 28px; overflow: hidden;">
      ${parsedOptions.map(opt => {
        const isSelected = opt.value === selected;
        return `
          <button type="button" class="${cn(buttonClass, isSelected ? activeClass : '')}"
                  data-value="${escapeHtml(String(opt.value || ''))}"
                  data-rnx-ignore="true"
                  data-ref="btn-${escapeHtml(String(opt.value || ''))}"
                  style="border-right: 1px solid var(--md-sys-color-outline-variant) !important; border-radius: 0;">
            ${isSelected ? '<i class="bi bi-check fs-6 me-1 mr-1"></i>' : (opt.icon ? `<i class="bi bi-${escapeHtml(opt.icon)} fs-6 me-1 mr-1"></i>` : '')}
            ${escapeHtml(opt.label || '')}
          </button>
        `;
      }).join('')}
    </div>
  `;

  const component = createComponent(template, { options, selected, className });

  component.useEffect(() => {
    // MEMORY LEAK FIX: Store handlers for cleanup
    const handlers = [];

    parsedOptions.forEach(opt => {
      const btn = component.refs[`btn-${opt.value}`];
      if (btn) {
        const handler = () => {
          if (onchange) onchange(opt.value);
        };
        btn.addEventListener('click', handler);
        handlers.push({ element: btn, handler });
      }
    });

    // Cleanup
    return () => {
      handlers.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
      });
    };
  });

  return component;
}
