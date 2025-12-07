import { createComponent } from '../../utils/createComponent.js';

export function Pagination({ pages = '[]', onpageclick }) {
  let parsedPages = [];
  try {
    parsedPages = typeof pages === 'string' ? JSON.parse(pages) : pages;
  } catch {}

  const template = () => `
    <nav>
      <ul class="pagination">
        ${parsedPages.map(p => `
          <li class="page-item${p.active ? ' active' : ''}">
            <a class="page-link" href="#" data-page="${p.value}">${p.label}</a>
          </li>
        `).join('')}
      </ul>
    </nav>
  `;

  const pagination = createComponent(template, { pages });

  pagination.useEffect(() => {
    if (onpageclick) {
      pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          onpageclick(e);
        });
      });
    }
  });

  return pagination;
}
