import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * TopAppBar Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Top application bar with leading/trailing actions.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.title=''] - App bar title
 * @param {string} [props.leadingIcon='menu'] - Leading icon name (Bootstrap Icons)
 * @param {string} [props.trailingIcon='more_vert'] - Trailing icon name
 * @param {Function} [props.onLeadingClick] - Leading button click handler
 * @param {Function} [props.onTrailingClick] - Trailing button click handler
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} TopAppBar element
 *
 * @example
 * <TopAppBar
 *   title="My App"
 *   leadingIcon="menu"
 *   trailingIcon="gear"
 *   onLeadingClick={() => openDrawer()}
 * />
 */
export function TopAppBar({
  title = '',
  leadingIcon = 'menu',
  trailingIcon = 'more_vert',
  onLeadingClick,
  onTrailingClick,
  className = ''
}) {
  // Resolve classes from active theme
  const appBarClass = cn(
    resolveClasses('topappbar'),
    'shadow-sm',
    className
  );

  const brandClass = resolvePartClasses('topappbar', 'brand');
  const navClass = resolvePartClasses('topappbar', 'nav');

  const template = () => `
    <header class="${appBarClass}">
       ${leadingIcon ? `
         <button class="btn btn-sm btn-link text-dark p-0 me-3 mr-3" data-ref="leading" data-rnx-ignore="true">
           <i class="bi bi-${escapeHtml(leadingIcon)}" style="font-size: 24px;"></i>
         </button>
       ` : ''}
       <h5 class="${brandClass} m-0 flex-grow-1 flex-1">${escapeHtml(title)}</h5>
       ${trailingIcon ? `
         <button class="btn btn-sm btn-link text-dark p-0 ms-3 ml-3" data-ref="trailing" data-rnx-ignore="true">
           <i class="bi bi-${escapeHtml(trailingIcon)}" style="font-size: 24px;"></i>
         </button>
       ` : ''}
    </header>
  `;

  const component = createComponent(template, { title, leadingIcon, trailingIcon, className });

  component.useEffect(() => {
    const handlers = [];

    if (onLeadingClick && component.refs.leading) {
      component.refs.leading.addEventListener('click', onLeadingClick);
      handlers.push({ element: component.refs.leading, handler: onLeadingClick });
    }
    if (onTrailingClick && component.refs.trailing) {
      component.refs.trailing.addEventListener('click', onTrailingClick);
      handlers.push({ element: component.refs.trailing, handler: onTrailingClick });
    }

    // Cleanup
    return () => {
      handlers.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
      });
    };
  });

  return component;
}
