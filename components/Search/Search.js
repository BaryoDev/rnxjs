import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Search Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Material Design 3 inspired search input with clear button.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.placeholder='Search...'] - Placeholder text
 * @param {string} [props.value=''] - Initial value
 * @param {Function} [props.onsearch] - Called when value changes
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Search element
 */
export function Search({ placeholder = 'Search...', value = '', onsearch, className = '' }) {
  // Resolve classes from active theme
  const wrapperClass = cn(
    resolveClasses('search'),
    'input-group',
    className
  );
  const inputClass = resolvePartClasses('search', 'input') || 'form-control bg-transparent border-0 shadow-none p-0';
  const iconClass = resolvePartClasses('search', 'icon') || 'input-group-text bg-transparent border-0 p-0 me-2 mr-2';
  const clearClass = resolvePartClasses('search', 'clear') || 'btn btn-link text-muted p-0 ms-2 ml-2';

  const template = ({ value }) => `
    <div class="${wrapperClass}" style="background-color: var(--md-sys-color-surface-variant); border-radius: 28px; padding: 4px 16px;">
      <span class="${iconClass}">
        <i class="bi bi-search"></i>
      </span>
      <input type="text" class="${inputClass}"
             placeholder="${escapeHtml(placeholder)}"
             value="${escapeHtml(value)}"
             data-ref="input"
             data-rnx-ignore="true"
             style="height: 40px;">
      ${value ? `
        <button class="${clearClass}" data-ref="clear" data-rnx-ignore="true">
          <i class="bi bi-x-lg"></i>
        </button>
      ` : ''}
    </div>
  `;

  const component = createComponent(template, { value, placeholder, className });

  component.useEffect((comp) => {
    // MEMORY LEAK FIX: Store handlers for cleanup
    const handlers = [];

    if (comp.refs.input) {
      const inputHandler = (e) => {
        const val = e.target.value;
        comp.setState({ value: val });
        if (onsearch) onsearch(val);
      };
      comp.refs.input.addEventListener('input', inputHandler);
      handlers.push({ element: comp.refs.input, handler: inputHandler, event: 'input' });
    }

    if (comp.refs.clear) {
      const clearHandler = () => {
        comp.setState({ value: '' });
        if (onsearch) onsearch('');
      };
      comp.refs.clear.addEventListener('click', clearHandler);
      handlers.push({ element: comp.refs.clear, handler: clearHandler, event: 'click' });
    }

    // Cleanup
    return () => {
      handlers.forEach(({ element, handler, event }) => {
        element.removeEventListener(event, handler);
      });
    };
  });

  return component;
}
