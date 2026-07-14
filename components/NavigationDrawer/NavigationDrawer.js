import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * NavigationDrawer Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Slide-out navigation drawer for mobile apps.
 *
 * @param {Object} props - Component properties
 * @param {Array} [props.links=[]] - Navigation links [{label, icon, href, active, onclick}]
 * @param {boolean} [props.isOpen=false] - Whether drawer is open
 * @param {Function} [props.onClose] - Called when backdrop is clicked
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} NavigationDrawer element
 *
 * @example
 * <NavigationDrawer
 *   links={[
 *     { label: 'Home', icon: 'house', href: '/' },
 *     { label: 'Profile', icon: 'person', href: '/profile', active: true }
 *   ]}
 *   isOpen={drawerOpen}
 *   onClose={() => setDrawerOpen(false)}
 * />
 */
export function NavigationDrawer({
  links = [],
  isOpen = false,
  onClose,
  className = ''
}) {
  // Resolve classes from active theme
  const drawerClass = cn(
    resolveClasses('navigationdrawer'),
    'm3-navigation-drawer',
    isOpen ? 'open' : '',
    className
  );

  const headerClass = resolvePartClasses('navigationdrawer', 'header');
  const navClass = resolvePartClasses('navigationdrawer', 'nav');
  const linkClass = resolvePartClasses('navigationdrawer', 'link');
  const activeClass = resolvePartClasses('navigationdrawer', 'active');
  const backdropClass = resolvePartClasses('navigationdrawer', 'backdrop');

  const template = ({ isOpen, links }) => `
    <div>
       <div class="${drawerClass}" data-ref="drawer">
          <div class="${headerClass || 'p-3 mb-3'}">
             <h5 class="m-0">Menu</h5>
          </div>
          <div class="${navClass || 'nav flex-column'}">
             ${links.map((link, idx) => `
               <a href="${escapeHtml(link.href || '#')}"
                  class="${linkClass || 'm3-drawer-link'} ${link.active ? (activeClass || 'active') : ''}"
                  data-index="${idx}"
                  data-ref="link-${idx}"
                  data-rnx-ignore="true"
               >
                  ${link.icon ? `<i class="bi bi-${escapeHtml(link.icon)} me-2 mr-2"></i>` : ''}
                  ${escapeHtml(link.label)}
               </a>
             `).join('')}
          </div>
       </div>
       ${isOpen ? `<div class="${backdropClass || 'modal-backdrop fade show'}" style="z-index: 1040" data-ref="backdrop"></div>` : ''}
    </div>
  `;

  const component = createComponent(template, { links, isOpen, className });

  component.useEffect((comp) => {
    // MEMORY LEAK FIX: Store handlers for proper cleanup
    const handlers = [];

    if (comp.refs.backdrop) {
      const backdropHandler = () => {
        if (onClose) onClose();
      };
      comp.refs.backdrop.addEventListener('click', backdropHandler);
      handlers.push({ element: comp.refs.backdrop, handler: backdropHandler, event: 'click' });
    }

    // Bind link clicks if they have onclick handlers in the data
    links.forEach((link, idx) => {
      const linkRef = comp.refs[`link-${idx}`];
      if (linkRef && link.onclick) {
        const linkHandler = (e) => {
          e.preventDefault();
          link.onclick(e);
        };
        linkRef.addEventListener('click', linkHandler);
        handlers.push({ element: linkRef, handler: linkHandler, event: 'click' });
      }
    });

    // Cleanup
    return () => {
      handlers.forEach(({ element, handler, event }) => {
        element.removeEventListener(event, handler);
      });
    };
  });

  return component;
}
