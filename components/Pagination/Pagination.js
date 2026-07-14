import { createComponent } from '../../utils/createComponent.js';
import { escapeHtml } from '../../utils/security.js';
import { resolveClasses, resolvePartClasses } from '../../utils/ThemeProvider.js';
import { cn } from '../../utils/classNames.js';

/**
 * Pagination Component - CSS Framework Agnostic
 *
 * Works with any registered theme (Bootstrap, Tailwind, custom).
 * Page navigation with customizable labels.
 *
 * @param {Object} props - Component properties
 * @param {string|Array} [props.pages='[]'] - Pages array [{label, value, active}]
 * @param {Function} [props.onpageclick] - Called when page is clicked
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
export function Pagination({ pages = '[]', onpageclick, className = '' }) {
  let parsedPages = [];
  try {
    parsedPages = typeof pages === 'string' ? JSON.parse(pages) : pages;
  } catch { }

  // Resolve classes from active theme
  const navClass = cn(resolveClasses('pagination'), className);
  const listClass = resolvePartClasses('pagination', 'list') || 'pagination';
  const itemClass = resolvePartClasses('pagination', 'item') || 'page-item';
  const activeClass = resolvePartClasses('pagination', 'active') || 'active';
  const linkClass = resolvePartClasses('pagination', 'link') || 'page-link';

  const template = () => `
    <nav class="${navClass}">
      <ul class="${listClass}">
        ${parsedPages.map(p => `
          <li class="${cn(itemClass, p.active ? activeClass : '')}">
            <a class="${linkClass}" href="#" data-page="${escapeHtml(String(p.value || ''))}" data-rnx-ignore="true">${escapeHtml(String(p.label || ''))}</a>
          </li>
        `).join('')}
      </ul>
    </nav>
  `;

  const pagination = createComponent(template, { pages, className });

  pagination.useEffect(() => {
    // MEMORY LEAK FIX: Store handlers for cleanup
    const handlers = [];

    if (onpageclick) {
      pagination.querySelectorAll(`.${linkClass.split(' ')[0]}`).forEach(link => {
        const handler = (e) => {
          e.preventDefault();
          onpageclick(e);
        };
        link.addEventListener('click', handler);
        handlers.push({ element: link, handler });
      });
    }

    // Cleanup
    return () => {
      handlers.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
      });
    };
  });

  return pagination;
}
