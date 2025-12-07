import { createComponent } from '../../utils/createComponent.js';

export function Tab({ title = '', id = '', children = '' }) {
  const template = () => `
    <div data-tab data-slot title="${title}" ${id ? `id="${id}"` : ''}></div>
  `;

  return createComponent(template, { title, id, children });
}
