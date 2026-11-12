import { createComponent } from '../../utils/createComponent.js';

import { escapeAttr } from '../../utils/security.js';
export function Tab({ title = '', id = '', children = '' }) {
  const template = () => `
    <div data-tab data-slot title="${escapeAttr(title)}" ${id ? `id="${escapeAttr(id)}"` : ''}></div>
  `;

  return createComponent(template, { title, id, children });
}
