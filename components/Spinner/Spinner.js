import { createComponent } from '../../utils/createComponent.js';

export function Spinner({ type = 'border', size = '', variant = 'primary', label = '' }) {
  const template = () => `
    <div class="spinner-${type} text-${variant} ${size ? `spinner-${type}-${size}` : ''}" role="status">
      <span class="visually-hidden">${label || 'Loading...'}</span>
    </div>
  `;

  return createComponent(template, { type, size, variant, label });
}
