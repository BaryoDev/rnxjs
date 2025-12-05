import { createComponent } from '../../utils/createComponent.js';

export function Alert({ variant = 'primary', dismissible = false, children = '', className = '', id = '' }) {
  const template = () => `
    <div id="${id}" class="alert alert-${variant} ${dismissible === 'true' ? 'alert-dismissible fade show' : ''} ${className}" role="alert" data-slot>
      ${dismissible === 'true' ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' : ''}
    </div>
  `;

  return createComponent(template, { variant, dismissible, children, className, id });
}
