import { createComponent } from '../../utils/createComponent.js';

export function Icon({ name = '', size = '', color = '', className = '' }) {
    // name: bootstrap icon name (without 'bi-' prefix, or with it - handle both)
    // size: fs-1, fs-2, etc. OR pixel size if applied via style
    // color: text-primary, text-danger, etc.

    const iconName = name.startsWith('bi-') ? name : `bi-${name}`;

    const template = () => `
    <i 
      class="bi ${iconName} ${size ? size : ''} ${color ? color : ''} ${className}" 
      data-ref="icon"
      role="img" 
      aria-label="${name}"
    ></i>
  `;

    return createComponent(template, { name, size, color, className });
}
