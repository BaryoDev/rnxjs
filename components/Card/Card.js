import { createComponent } from '../../utils/createComponent.js';

export function Card({ title = '', subtitle = '', footer = '', variant = 'outlined', children = '' }) {
  // variants: outlined (default), elevated, filled
  const template = () => `
    <div class="card ${variant}">
      ${title || subtitle ? `
        <div class="card-header">
          ${title ? `<h5 class="card-title mb-0">${title}</h5>` : ''}
          ${subtitle ? `<small class="text-muted">${subtitle}</small>` : ''}
        </div>` : ''}
      <div class="card-body" data-slot></div>
      ${footer ? `<div class="card-footer text-muted">${footer}</div>` : ''}
    </div>
  `;

  return createComponent(template, { title, subtitle, footer, variant, children });
}
