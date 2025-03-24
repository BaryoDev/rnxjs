import { createComponent } from '../../utils/createComponent.js';

export function Row({ children = '', justify = '', align = '', noGutters = false }) {
  const template = () => `
    <div class="row ${justify ? 'justify-content-' + justify : ''} ${align ? 'align-items-' + align : ''} ${noGutters === 'true' ? 'g-0' : ''}" data-slot></div>
  `;

  return createComponent(template, { children, justify, align, noGutters });
}
