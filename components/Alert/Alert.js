import { createComponent } from '../../utils/createComponent.js';

export function Alert({ message = '', variant = 'primary', dismissible = false }) {
  const template = () => `
    <div class="alert alert-${variant} ${dismissible ? 'alert-dismissible fade show' : ''}" role="alert" data-ref="alert">
      ${message}
      <span data-slot></span>
      ${dismissible ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' : ''}
    </div>
  `;

  return createComponent(template, { message, variant, dismissible });
}
