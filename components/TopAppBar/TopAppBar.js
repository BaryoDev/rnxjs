import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses, resolveUtility } from '../../utils/ThemeProvider.js';
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
 * @param {string} [props.leadingLabel='Menu'] - Accessible label for the leading button
 * @param {string} [props.trailingLabel='More options'] - Accessible label for the trailing button
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
  leadingLabel = 'Menu',
  trailingLabel = 'More options',
  className = ''
} = {}) {
  // Resolve classes from active theme
  const appBarClass = cn(
    resolveClasses('topappbar'),
    resolveUtility('layout', 'flex'),
    resolveUtility('flexbox', 'alignCenter'),
    className
  );

  const brandClass = resolvePartClasses('topappbar', 'brand');
  const navClass = resolvePartClasses('topappbar', 'nav');
  const iconButtonClass = resolveClasses('button', { variant: 'text', size: 'sm' });

  const template = () => `
    <header class="${appBarClass}">
       ${leadingIcon ? `
         <button type="button" class="${iconButtonClass}" data-ref="leading" data-rnx-ignore="true" aria-label="${escapeHtml(leadingLabel)}">
           <i class="bi bi-${escapeHtml(leadingIcon)}" style="font-size: 24px;" aria-hidden="true"></i>
         </button>
       ` : ''}
       <h5 class="${cn(brandClass, resolveUtility('spacing', 'm', 0))}" style="flex: 1 1 auto;">${escapeHtml(title)}</h5>
       ${trailingIcon ? `
         <div class="${navClass}">
           <button type="button" class="${iconButtonClass}" data-ref="trailing" data-rnx-ignore="true" aria-label="${escapeHtml(trailingLabel)}">
             <i class="bi bi-${escapeHtml(trailingIcon)}" style="font-size: 24px;" aria-hidden="true"></i>
           </button>
         </div>
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
