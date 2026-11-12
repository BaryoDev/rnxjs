import { createComponent } from '../../utils/createComponent.js';

import { escapeHtml } from '../../utils/security.js';
export function Tab({ title = '', id = '', children = '' }) {
  const template = () => `
    <div data-tab data-slot title="${escapeHtml(title)}" ${id ? `id="${escapeHtml(id)}"` : ''}></div>
  `;

  return createComponent(template, { title, id, children });
}
