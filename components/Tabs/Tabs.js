import { createComponent } from '../../utils/createComponent.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';
import { escapeHtml } from '../../utils/security.js';

/**
 * Tabs Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Creates tabbed navigation with content panels.
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
}) {
  // Resolve classes from active theme
  const tabsClass = cn(
    resolveClasses('tabs', { variant }),
    className
  );

  const contentClass = resolvePartClasses('tabs', 'content');
  const itemClass = resolvePartClasses('tabs', 'item');
  const linkClass = resolvePartClasses('tabs', 'link');
  const paneClass = resolvePartClasses('tabs', 'pane');
  const activeClass = resolveClasses('tabs', { active: true });

  const template = () => `
    <div>
      <ul class="${tabsClass}" role="tablist" data-ref="nav"></ul>
      <div class="${contentClass}" data-ref="content"></div>
      <div style="display: none;" data-slot></div>
    </div>
  `;

  const tabs = createComponent(template, { variant, children, className });

  tabs.useEffect(() => {
    const tabElements = tabs.querySelectorAll('[data-tab]');
    const nav = tabs.refs.nav;
    const content = tabs.refs.content;

    tabElements.forEach((el, i) => {
      // Use existing ID if provided, otherwise generate one
      const existingId = el.getAttribute('id');
      const tabId = existingId || `tab-${i}`;

      const title = el.getAttribute('title') || `Tab ${i + 1}`;
      const active = i === 0;

      // Nav item
      const navItem = document.createElement('li');
      navItem.className = itemClass;
      navItem.innerHTML = `
        <button class="${linkClass} ${active ? activeClass : ''}" data-bs-toggle="tab" data-bs-target="#${escapeHtml(tabId)}" type="button" role="tab">${escapeHtml(title)}</button>
      `;
      nav.appendChild(navItem);

      // Content pane
      el.classList.add(...paneClass.split(' ').filter(Boolean), 'fade');
      if (active) el.classList.add('show', 'active');
      el.id = tabId;
      content.appendChild(el);
    });
  });

  return tabs;
}
