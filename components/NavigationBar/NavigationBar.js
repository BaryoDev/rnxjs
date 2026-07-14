import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses, resolveUtility } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * NavigationBar Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Bottom navigation bar for mobile apps with icon and label items.
 *
 * @param {Object} props - Component properties
 * @param {Array} [props.items=[]] - Navigation items [{label, icon}]
 * @param {number} [props.activeIndex=0] - Currently active item index
 * @param {Function} [props.onchange] - Called when active item changes
 * @param {string} [props.ariaLabel='Main'] - Accessible label for the navigation landmark
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} NavigationBar element
 *
 * @example
 * <NavigationBar
 *   items={[
 *     { label: 'Home', icon: 'house' },
 *     { label: 'Search', icon: 'search' },
 *     { label: 'Profile', icon: 'person' }
 *   ]}
 *   activeIndex={0}
 *   onchange={(idx) => setActiveTab(idx)}
 * />
 */
export function NavigationBar({
  items = [],
  activeIndex = 0,
  onchange,
  ariaLabel = 'Main',
  className = ''
} = {}) {
  // Resolve classes from active theme
  const navbarClass = cn(
    resolveClasses('navigationbar'),
    resolveUtility('sizing', 'w100'),
    resolveUtility('layout', 'flex'),
    resolveUtility('flexbox', 'justifyAround'),
    resolveUtility('flexbox', 'alignCenter'),
    'navigation-bar',
    className
  );
  const linkClass = resolvePartClasses('navigationbar', 'link');

  const template = ({ activeIndex, items }) => `
    <nav class="${navbarClass}" aria-label="${escapeHtml(ariaLabel)}">
      ${items.map((item, idx) => `
        <button type="button"
                class="${cn(linkClass, 'navigation-bar-item', idx === activeIndex ? 'active' : '')}"
                data-index="${idx}"
                data-rnx-ignore="true"
                data-ref="nav-${idx}"
                ${idx === activeIndex ? 'aria-current="page"' : ''}>
           ${item.icon ? `<i class="bi bi-${escapeHtml(item.icon)}" aria-hidden="true"></i>` : ''}
           <span class="navigation-bar-label">${escapeHtml(item.label)}</span>
        </button>
      `).join('')}
    </nav>
  `;

  const component = createComponent(template, { items, activeIndex, className });

  component.useEffect(() => {
    const handlers = [];

    items.forEach((item, idx) => {
      const btn = component.refs[`nav-${idx}`];
      if (btn) {
        const handler = () => {
          if (onchange) onchange(idx);
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
