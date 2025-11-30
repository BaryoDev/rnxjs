import { createComponent } from '../../utils/createComponent.js';

export function Button({ label = '', variant = 'primary', size = '', block = false, onclick, children }) {
  // If onclick is a string (e.g. "logout()"), put it directly in the HTML
  const clickAttr = (typeof onclick === 'string') ? `onclick="${onclick}"` : '';

  const template = () => `
    <button 
      class="btn btn-${variant} ${size ? 'btn-' + size : ''} ${block === 'true' ? 'w-100' : ''}" 
      type="button"
      data-ref="btn"
      ${clickAttr}
    >
      ${label}
      <span data-slot></span>
    </button>
  `;

  const btn = createComponent(template, { label, variant, size, block, children });

  btn.useEffect(() => {
    // Only add listener if it's a real function
    if (typeof onclick === 'function' && btn.refs && btn.refs.btn) {
      const handler = onclick;
      btn.refs.btn.addEventListener('click', handler);

      // Return cleanup function to remove event listener
      return () => {
        if (btn.refs && btn.refs.btn) {
          btn.refs.btn.removeEventListener('click', handler);
        }
      };
    }
  });

  return btn;
}
