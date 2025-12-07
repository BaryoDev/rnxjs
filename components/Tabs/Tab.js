import { createComponent } from '../../utils/createComponent.js';

export function Tab({ title = '', children = '' }) {
  const template = () => `
    <div data-tab data-slot></div>
  `;

  return createComponent(template, { title, children });
}
