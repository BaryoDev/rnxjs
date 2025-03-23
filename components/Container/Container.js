import { createComponent } from '../../utils/createComponent.js';

export function Container({ fluid = false, children = '' }) {
  const template = () => `
    <div class="${fluid === 'true' ? 'container-fluid' : 'container'}" data-slot></div>
  `;

  return createComponent(template, { fluid, children });
}
