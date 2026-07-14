import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
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
  className = ''
}) {
  // Resolve classes from active theme
  const navbarClass = cn(
    resolveClasses('navigationbar'),
    'w-100 w-full d-flex flex justify-content-around justify-around items-center',
    className
  );

  const template = ({ activeIndex, items }) => `
    <div class="${navbarClass}" style="background-color: var(--md-sys-color-surface-container, #f5f5f5); height: 80px;">
      ${items.map((item, idx) => `
        <button class="btn btn-link text-decoration-none d-flex flex-column align-items-center p-0 ${idx === activeIndex ? 'text-primary text-blue-600' : 'text-muted text-slate-500'}"
                data-index="${idx}"
                data-rnx-ignore="true"
                data-ref="nav-${idx}"
                style="width: 64px;">
           <span class="d-flex flex align-items-center items-center justify-content-center justify-center mb-1"
                 style="${idx === activeIndex ? 'background-color: var(--md-sys-color-secondary-container, #e3f2fd); width: 64px; height: 32px; border-radius: 16px;' : ''}">
              <i class="bi bi-${escapeHtml(item.icon)}" style="${idx === activeIndex ? 'color: var(--md-sys-color-on-secondary-container, #1565c0)' : ''}"></i>
           </span>
           <span style="font-size: 12px; font-weight: 500;">${escapeHtml(item.label)}</span>
        </button>
      `).join('')}
    </div>
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
