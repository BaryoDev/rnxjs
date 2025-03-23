import { createComponent } from '../../utils/createComponent.js';

export function Accordion({ id = 'accordion', children = '' }) {
  const template = () => `
    <div class="accordion" id="${id}" data-slot></div>
  `;

  return createComponent(template, { id, children });
}
