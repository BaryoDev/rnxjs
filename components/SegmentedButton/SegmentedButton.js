import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import themeProvider, { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

const themeState = (component, state) => {
  const theme = themeProvider.getTheme();
  return (theme && theme.components[component] && theme.components[component].states &&
    theme.components[component].states[state]) || '';
};

/**
 * SegmentedButton Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Segmented button group for exclusive selection.
 *
 * @param {Object} props - Component properties
 * @param {Array|string} [props.options=[]] - Button options [{label, value, icon}]
 * @param {string} [props.selected=''] - Currently selected value
 * @param {Function} [props.onchange] - Called when selection changes
 * @param {string} [props.label=''] - Accessible label for the group
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} SegmentedButton element
 */
export function SegmentedButton({ options = [], selected = '', onchange, label = '', className = '' } = {}) {
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
  if (!Array.isArray(parsedOptions)) parsedOptions = [];

  // Resolve classes from active theme
  const groupClass = cn(
    resolveClasses('segmentedbutton'),
    'segmented-button',
    className
  );
  const buttonClass = resolvePartClasses('segmentedbutton', 'button') || 'segmented-button-option';
  const activeClass = themeState('segmentedbutton', 'active') || 'active';

  const template = ({ selected }) => `
    <div class="${groupClass}" role="group"${label ? ` aria-label="${escapeHtml(label)}"` : ''}>
      ${parsedOptions.map(opt => {
        const isSelected = opt.value === selected;
        return `
          <button type="button" class="${cn(buttonClass, isSelected ? activeClass : '')}"
                  data-value="${escapeHtml(String(opt.value ?? ''))}"
                  data-rnx-ignore="true"
                  data-ref="btn-${escapeHtml(String(opt.value ?? ''))}"
                  aria-pressed="${isSelected ? 'true' : 'false'}">
            ${isSelected ? '<i class="bi bi-check" aria-hidden="true"></i>' : (opt.icon ? `<i class="bi bi-${escapeHtml(opt.icon)}" aria-hidden="true"></i>` : '')}
            ${escapeHtml(opt.label || '')}
          </button>
        `;
      }).join('')}
    </div>
  `;

  const component = createComponent(template, { options, selected, className });

  component.useEffect((el) => {
    // MEMORY LEAK FIX: Store handlers for cleanup
    const handlers = [];

    parsedOptions.forEach(opt => {
      const btn = el.refs[`btn-${opt.value}`];
      if (btn) {
        const handler = () => {
          el.setState({ selected: opt.value });
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
