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
 * @param {Function} [props.onClose] - Called when backdrop is clicked or Escape is pressed
 * @param {string} [props.title='Menu'] - Drawer header title
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
  title = 'Menu',
  className = ''
} = {}) {
  // Resolve classes from active theme
  const drawerClass = cn(
    resolveClasses('navigationdrawer'),
    'm3-navigation-drawer',
    isOpen ? 'open' : '',
    className
  );

  const headerClass = resolvePartClasses('navigationdrawer', 'header');
  const titleClass = resolvePartClasses('navigationdrawer', 'title');
  const bodyClass = resolvePartClasses('navigationdrawer', 'body');
  const overlayClass = resolvePartClasses('navigationdrawer', 'overlay');

  const template = ({ isOpen, links }) => `
    <div>
       <div class="${drawerClass}" data-ref="drawer" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}" tabindex="-1"${isOpen ? '' : ' aria-hidden="true"'}>
          <div class="${headerClass || 'p-3 mb-3'}">
             <h5 class="${titleClass || 'm-0'}">${escapeHtml(title)}</h5>
          </div>
          <nav class="${bodyClass || 'nav flex-column'}" aria-label="Drawer">
             ${links.map((link, idx) => `
               <a href="${escapeHtml(link.href || '#')}"
                  class="${cn('m3-drawer-link', link.active ? 'active' : '')}"
                  data-index="${idx}"
                  data-ref="link-${idx}"
                  data-rnx-ignore="true"
                  ${link.active ? 'aria-current="page"' : ''}
               >
                  ${link.icon ? `<i class="bi bi-${escapeHtml(link.icon)}" aria-hidden="true"></i> ` : ''}
                  ${escapeHtml(link.label)}
               </a>
             `).join('')}
          </nav>
       </div>
       ${isOpen ? `<div class="${overlayClass || 'modal-backdrop fade show'}"${overlayClass ? '' : ' style="z-index: 1040"'} data-ref="backdrop" aria-hidden="true"></div>` : ''}
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
      handlers.push({ target: comp.refs.backdrop, handler: backdropHandler, event: 'click' });
    }

    // Escape-to-close while open
    if (isOpen && onClose) {
      const escapeHandler = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', escapeHandler);
      handlers.push({ target: document, handler: escapeHandler, event: 'keydown' });
    }

    // Move focus into the drawer when opened
    if (isOpen && comp.refs.drawer && !comp.refs.drawer.contains(document.activeElement)) {
      comp.refs.drawer.focus();
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
        handlers.push({ target: linkRef, handler: linkHandler, event: 'click' });
      }
    });

    // Cleanup
    return () => {
      handlers.forEach(({ target, handler, event }) => {
        target.removeEventListener(event, handler);
      });
    };
  });

  return component;
}
