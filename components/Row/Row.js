import { createComponent } from '../../utils/createComponent.js';

export function Row({ children = '', justify = '', align = '', noGutters = false, className = '' }) {
  const template = ({ className, class: cls }) => `
    <div class="row ${justify ? 'justify-content-' + justify : ''} ${align ? 'align-items-' + align : ''} ${noGutters === 'true' ? 'g-0' : ''} ${className || cls || ''}" data-slot></div>
  `;

  return createComponent(template, { children, justify, align, noGutters });
}
