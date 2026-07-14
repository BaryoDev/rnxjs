import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import themeProvider, { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

const themeState = (component, state) => {
  const theme = themeProvider.getTheme();
  return (theme && theme.components[component] && theme.components[component].states &&
    theme.components[component].states[state]) || '';
};

const PREV_LABELS = ['«', '‹', 'prev', 'previous'];
const NEXT_LABELS = ['»', '›', 'next'];

/**
 * Pagination Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Accessible page navigation with customizable labels.
 *
 * @param {Object} props - Component properties
 * @param {string|Array} [props.pages='[]'] - Pages array [{label, value, active, disabled, ariaLabel}]
 * @param {Function} [props.onpageclick] - Called when page is clicked
 * @param {string} [props.label='Pagination'] - Accessible label for the nav landmark
 * @param {string} [props.className=''] - Custom classes for Blazor-style customization
 * @returns {HTMLElement} Pagination element
 *
 * @example
 * <Pagination
 *   pages={[
 *     { label: '1', value: 1, active: true },
 *     { label: '2', value: 2 },
 *     { label: '3', value: 3 }
 *   ]}
 *   onpageclick={(e) => console.log(e.target.dataset.page)}
 * />
 */
export function Pagination({ pages = '[]', onpageclick, label = 'Pagination', className = '' } = {}) {
  let parsedPages = [];
  try {
    parsedPages = typeof pages === 'string' ? JSON.parse(pages) : pages;
  } catch { }
  if (!Array.isArray(parsedPages)) parsedPages = [];

  // Resolve classes from active theme
  const listClass = cn(resolveClasses('pagination'), 'pagination');
  const itemClass = resolvePartClasses('pagination', 'item');
  const linkClass = resolvePartClasses('pagination', 'link') || 'page-link';
  const activeClass = themeState('pagination', 'active') || 'active';
  const disabledClass = themeState('pagination', 'disabled') || 'disabled';

  const autoAriaLabel = (p) => {
    if (p.ariaLabel) return p.ariaLabel;
    const text = String(p.label || '').toLowerCase();
    if (PREV_LABELS.includes(text)) return 'Previous page';
    if (NEXT_LABELS.includes(text)) return 'Next page';
    return '';
  };

  const template = () => `
    <nav class="${cn('pagination-nav', className)}" aria-label="${escapeHtml(label)}">
      <ul class="${listClass}" style="list-style: none;">
        ${parsedPages.map(p => {
          const isActive = p.active === true || p.active === 'true';
          const isDisabled = p.disabled === true || p.disabled === 'true';
          const itemAriaLabel = autoAriaLabel(p);
          return `
          <li class="${cn(itemClass, isActive ? activeClass : '', isDisabled ? disabledClass : '')}">
            <a class="${cn(linkClass, isActive ? activeClass : '', isDisabled ? disabledClass : '')}"
               href="#"
               data-page="${escapeHtml(String(p.value ?? ''))}"
               data-rnx-ignore="true"
               ${isActive ? 'aria-current="page"' : ''}
               ${isDisabled ? 'aria-disabled="true" tabindex="-1"' : ''}
               ${itemAriaLabel ? `aria-label="${escapeHtml(itemAriaLabel)}"` : ''}>${escapeHtml(String(p.label ?? ''))}</a>
          </li>
        `;
        }).join('')}
      </ul>
    </nav>
  `;

  const pagination = createComponent(template, { pages, className });

  pagination.useEffect(() => {
    // MEMORY LEAK FIX: Store handlers for cleanup
    const handlers = [];

    pagination.querySelectorAll('a[data-page]').forEach(link => {
      const handler = (e) => {
        e.preventDefault();
        if (link.getAttribute('aria-disabled') === 'true') return;
        if (onpageclick) onpageclick(e);
      };
      link.addEventListener('click', handler);
      handlers.push({ element: link, handler });
    });

    // Cleanup
    return () => {
      handlers.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
      });
    };
  });

  return pagination;
}
