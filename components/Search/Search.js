import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

let searchUid = 0;

const searchIconSvg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="7" cy="7" r="5"></circle><line x1="10.8" y1="10.8" x2="14.5" y2="14.5"></line></svg>';
const clearIconSvg = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" focusable="false"><line x1="1" y1="1" x2="11" y2="11"></line><line x1="11" y1="1" x2="1" y2="11"></line></svg>';

/**
 * Search Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Search input with icon and clear button.
 *
 * @param {Object} [props={}] - Component properties
 * @param {string} [props.placeholder='Search...'] - Placeholder text
 * @param {string} [props.value=''] - Initial value
 * @param {string} [props.label='Search'] - Accessible label for the input
 * @param {string} [props.name=''] - Input name attribute
 * @param {Function} [props.onsearch] - Called when value changes
 * @param {string} [props.id] - Input HTML id attribute (auto-generated if omitted)
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Search element
 */
export function Search({
  placeholder = 'Search...',
  value = '',
  label = 'Search',
  name = '',
  onsearch,
  id,
  className = ''
} = {}) {
  const finalId = id || `search-${++searchUid}`;

  // Resolve classes from active theme
  const wrapperClass = cn(resolveClasses('search'), className);
  const inputClass = resolvePartClasses('search', 'input');
  const iconClass = resolvePartClasses('search', 'icon') || resolvePartClasses('input', 'icon');
  const clearClass = resolvePartClasses('search', 'button');

  const template = ({ value }) => `
    <div class="${wrapperClass}" role="search">
      <span class="${iconClass}" aria-hidden="true">${searchIconSvg}</span>
      <input type="search" class="${inputClass}"
             id="${escapeHtml(finalId)}"
             ${name ? `name="${escapeHtml(name)}"` : ''}
             placeholder="${escapeHtml(placeholder)}"
             aria-label="${escapeHtml(label || placeholder)}"
             value="${escapeHtml(value)}"
             data-ref="input"
             data-rnx-ignore="true">
      ${value ? `
        <button type="button" class="${clearClass}" aria-label="Clear search" data-ref="clear" data-rnx-ignore="true">
          ${clearIconSvg}
        </button>
      ` : ''}
    </div>
  `;

  const component = createComponent(template, { value, placeholder, className });

  component.useEffect((comp) => {
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

    return () => {
      handlers.forEach(({ element, handler, event }) => {
        element.removeEventListener(event, handler);
      });
    };
  });

  return component;
}
