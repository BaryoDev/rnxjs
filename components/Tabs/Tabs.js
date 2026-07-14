import { createComponent } from '../../utils/createComponent.js';
import themeProvider, { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

let tabsIdCounter = 0;

const themeState = (component, state) => {
  const theme = themeProvider.getTheme();
  return (theme && theme.components[component] && theme.components[component].states &&
    theme.components[component].states[state]) || '';
};

/**
 * Tabs Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Creates accessible tabbed navigation (WAI-ARIA tabs pattern) with content panels.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.variant='tabs'] - Tab style (tabs, pills)
 * @param {string} [props.children=''] - Tab panels with data-tab attribute
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Tabs element
 *
 * @example
 * <Tabs>
 *   <div data-tab title="First">Content 1</div>
 *   <div data-tab title="Second">Content 2</div>
 * </Tabs>
 *
 * @example
 * // Pills variant
 * <Tabs variant="pills">...</Tabs>
 */
export function Tabs({
  variant = 'tabs',
  children = '',
  className = ''
} = {}) {
  // Resolve classes from active theme
  const tabsClass = cn(
    resolveClasses('tabs', { variant }),
    className
  );

  const contentClass = resolvePartClasses('tabs', 'content');
  const itemClass = resolvePartClasses('tabs', 'item');
  const linkClass = resolvePartClasses('tabs', 'link');
  const paneTokens = resolvePartClasses('tabs', 'pane').split(' ').filter(Boolean);
  const activeTokens = (themeState('tabs', 'active') || 'active').split(' ').filter(Boolean);
  const instanceId = ++tabsIdCounter;

  const template = () => `
    <div>
      <ul class="${tabsClass}" role="tablist" data-ref="nav"></ul>
      <div class="${contentClass}" data-ref="content"></div>
      <div style="display: none;" data-slot></div>
    </div>
  `;

  const tabs = createComponent(template, { variant, children, className });

  tabs.useEffect(() => {
    const tabElements = Array.from(tabs.querySelectorAll('[data-tab]'));
    const nav = tabs.refs.nav;
    const content = tabs.refs.content;
    const buttons = [];
    const panes = [];
    const handlers = [];

    const activate = (index) => {
      buttons.forEach((btn, i) => {
        const selected = i === index;
        btn.setAttribute('aria-selected', selected ? 'true' : 'false');
        btn.setAttribute('tabindex', selected ? '0' : '-1');
        activeTokens.forEach(t => btn.classList.toggle(t, selected));
        btn.classList.toggle('active', selected);

        const pane = panes[i];
        if (!pane) return;
        if (selected) {
          pane.hidden = false;
          pane.classList.remove('hidden');
          pane.classList.add('show', 'active');
        } else {
          pane.hidden = true;
          pane.classList.remove('show', 'active');
          paneTokens.forEach(t => pane.classList.add(t));
        }
      });
    };

    tabElements.forEach((el, i) => {
      // Use existing ID if provided, otherwise generate one
      const existingId = el.getAttribute('id');
      const tabId = existingId || `rnx-tabs-${instanceId}-pane-${i}`;

      const title = el.getAttribute('title') || `Tab ${i + 1}`;
      const active = i === 0;

      // Nav item
      const navItem = document.createElement('li');
      navItem.className = itemClass;
      navItem.setAttribute('role', 'presentation');
      navItem.innerHTML = `
        <button class="${cn(linkClass, active ? activeTokens.join(' ') : '', active ? 'active' : '')}" id="${escapeHtml(tabId)}-tab" type="button" role="tab" aria-selected="${active ? 'true' : 'false'}" aria-controls="${escapeHtml(tabId)}" tabindex="${active ? '0' : '-1'}">${escapeHtml(title)}</button>
      `;
      nav.appendChild(navItem);
      const button = navItem.querySelector('button');
      buttons.push(button);

      // Content pane
      el.classList.add(...paneTokens);
      if (active) {
        el.classList.add('show', 'active');
        el.classList.remove('hidden');
      } else {
        el.hidden = true;
      }
      el.id = tabId;
      el.setAttribute('role', 'tabpanel');
      el.setAttribute('aria-labelledby', `${tabId}-tab`);
      el.setAttribute('tabindex', '0');
      content.appendChild(el);
      panes.push(el);
    });

    buttons.forEach((button, i) => {
      const onClick = () => activate(i);
      const onKeydown = (e) => {
        let target = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          target = (i + 1) % buttons.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          target = (i - 1 + buttons.length) % buttons.length;
        } else if (e.key === 'Home') {
          target = 0;
        } else if (e.key === 'End') {
          target = buttons.length - 1;
        }
        if (target !== null) {
          e.preventDefault();
          activate(target);
          buttons[target].focus();
        }
      };
      button.addEventListener('click', onClick);
      button.addEventListener('keydown', onKeydown);
      handlers.push({ element: button, click: onClick, keydown: onKeydown });
    });

    return () => {
      handlers.forEach(({ element, click, keydown }) => {
        element.removeEventListener('click', click);
        element.removeEventListener('keydown', keydown);
      });
    };
  });

  return tabs;
}
