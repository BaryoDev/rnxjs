import { createComponent } from '../../utils/createComponent.js';

export function Button({ label = '', variant = 'filled', size = '', icon = '', block = false, onclick, children, ...rest }) {
  // variants: filled (default), outlined, text, elevated, tonal

  let btnClass = 'btn';

  switch (variant) {
    case 'filled': btnClass += ' btn-primary'; break;
    case 'outlined': btnClass += ' btn-outline-primary'; break;
    case 'text': btnClass += ' btn-link'; break;
    case 'elevated': btnClass += ' btn-primary elevated'; break;
    case 'tonal': btnClass += ' btn-secondary'; break;
    default: btnClass += ` btn-${variant}`; // Fallback for standard bootstrap
  }

  if (block) btnClass += ' w-100';
  if (size === 'sm') btnClass += ' btn-sm';
  if (size === 'lg') btnClass += ' btn-lg';

  const clickAttr = (typeof onclick === 'string') ? `onclick="${onclick}"` : '';

  // Create attribute string from rest props
  const restAttrs = Object.entries(rest).map(([key, value]) => `${key}="${value}"`).join(' ');

  const template = () => `
    <button 
      class="${btnClass}" 
      type="button"
      data-ref="btn"
      ${clickAttr}
      ${restAttrs}
    >
      ${icon ? `<span class="material-symbols-outlined">${icon}</span>` : ''}
      ${label}
      <span data-slot></span>
    </button>
  `;

  const btn = createComponent(template, { label, variant, size, icon, block, children, ...rest });

  btn.useEffect(() => {
    if (typeof onclick === 'function' && btn.refs && btn.refs.btn) {
      const handler = onclick;
      btn.refs.btn.addEventListener('click', handler);
      return () => {
        if (btn.refs && btn.refs.btn) {
          btn.refs.btn.removeEventListener('click', handler);
        }
      };
    }
  });

  return btn;
}
