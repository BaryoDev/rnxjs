import { createComponent } from '../../utils/createComponent.js';

export function Badge({ label = '', variant = 'secondary', pill = false }) {
  const template = () => `
    <span class="badge ${pill === 'true' ? 'rounded-pill' : ''} bg-${variant}">
      ${label}
    </span>
  `;

  return createComponent(template, { label, variant, pill });
}
